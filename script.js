// ===============================
// SUMIT FF STORE - MAIN SCRIPT
// ===============================

import {
  auth,
  db,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "./firebase.js";

const storePage = document.getElementById("storePage");
const paymentPage = document.getElementById("paymentPage");
const accountPage = document.getElementById("accountPage");
const purchasesPage = document.getElementById("purchasesPage");

let currentID = "FF ID";
let currentPrice = 0;

let purchasesUnsubscribe = null;


// ===============================
// PAGE NAVIGATION
// ===============================

function showPage(page) {

  [
    storePage,
    paymentPage,
    accountPage,
    purchasesPage
  ].forEach(p => {

    if (!p) return;

    p.classList.remove("active");
    p.classList.add("hidden");

  });

  if (page) {

    page.classList.remove("hidden");
    page.classList.add("active");

  }

  window.scrollTo(0, 0);
}


window.openStore = () => showPage(storePage);

window.openPayment = () => showPage(paymentPage);

window.openAccount = () => showPage(accountPage);

window.goHome = () => showPage(storePage);


// ===============================
// BUY NOW
// ===============================

window.buyNow = function(name, price) {

  currentID = name;
  currentPrice = price;

  const title =
    document.getElementById("payTitle");

  const amount =
    document.getElementById("payAmount");

  if (title)
    title.innerText = name;

  if (amount)
    amount.innerText = "₹" + price;

  showPage(paymentPage);

};


// ===============================
// UPI PAYMENT
// ===============================

window.payUPI = function() {

  const upi = "jaiswara@fam";

  const url =
    `upi://pay?pa=${upi}` +
    `&pn=SumitFFStore` +
    `&am=${currentPrice}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(currentID)}`;

  window.location.href = url;

};


// ===============================
// MY PURCHASES
// ===============================

window.openPurchases = function() {

  const user = auth.currentUser;

  if (!user) {

    alert("Pehle login karo.");

    openAccount();

    return;

  }

  showPage(purchasesPage);

  loadPurchases(user.uid);

};


// ===============================
// FIRESTORE LIVE PURCHASES
// ===============================

function loadPurchases(uid) {

  const loading =
    document.getElementById("purchasesLoading");

  const empty =
    document.getElementById("purchasesEmpty");

  const list =
    document.getElementById("purchasesList");


  if (!loading || !empty || !list)
    return;


  loading.style.display = "block";

  empty.style.display = "none";

  list.innerHTML = "";


  if (purchasesUnsubscribe) {

    purchasesUnsubscribe();

    purchasesUnsubscribe = null;

  }


  const ordersRef =
    collection(db, "orders");


  const q = query(
    ordersRef,
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );


  purchasesUnsubscribe =
    onSnapshot(q, (snapshot) => {

      loading.style.display = "none";

      list.innerHTML = "";


      if (snapshot.empty) {

        empty.style.display = "block";

        return;

      }


      empty.style.display = "none";


      snapshot.forEach((docSnap) => {

        const order = docSnap.data();

        const status =
          String(order.status || "pending")
          .toLowerCase();


        let statusClass =
          "status-pending";


        if (status === "approved")
          statusClass = "status-approved";


        if (status === "rejected")
          statusClass = "status-rejected";


        if (status === "delivered")
          statusClass = "status-delivered";


        let date =
          "Date unavailable";


        if (order.createdAt?.toDate) {

          date =
            order.createdAt
            .toDate()
            .toLocaleString("en-IN");

        }


        const card =
          document.createElement("div");


        card.className =
          "purchase-card";


        card.innerHTML = `

          <div class="purchase-top">

            <div class="purchase-title">
              ${order.account || "FF ID"}
            </div>

            <div class="purchase-status ${statusClass}">
              ${status.toUpperCase()}
            </div>

          </div>


          <div class="purchase-price">
            ₹${order.amount || 0}
          </div>


          <div class="purchase-info">

            📱 Mobile:
            ${order.phone || "Not available"}

            <br>

            🔢 UTR:
            ${
              order.utr
              ? "••••••" +
                String(order.utr).slice(-6)
              : "Not available"
            }

            <br>

            📅 ${date}

          </div>

        `;


        list.appendChild(card);

      });


    }, (error) => {

      console.error(
        "Firestore error:",
        error
      );


      loading.style.display = "none";


      list.innerHTML = `

        <div class="purchase-card"
             style="text-align:center;color:#ff5252;">

          Unable to load purchases.

          <br>

          <small>
            ${error.message}
          </small>

        </div>

      `;

    });

}


// ===============================
// SUBMIT ORDER
// ===============================

window.submitOrder = async function() {

  const user = auth.currentUser;


  if (!user) {

    alert(
      "Order submit karne se pehle login karo."
    );

    openAccount();

    return;

  }


  const phone =
    document
    .getElementById("phone")
    ?.value
    .trim();


  const utr =
    document
    .getElementById("utr")
    ?.value
    .trim();


  const file =
    document
    .getElementById("shot")
    ?.files[0];


  if (!phone ||
      !/^[0-9]{10}$/.test(phone)) {

    alert(
      "10 digit mobile number dalo."
    );

    return;

  }


  if (!utr ||
      !/^[0-9]{12}$/.test(utr)) {

    alert(
      "12 digit UTR number dalo."
    );

    return;

  }


  if (!file) {

    alert(
      "Payment screenshot upload karo."
    );

    return;

  }


  const formData =
    new FormData();


  formData.append(
    "phone",
    phone
  );

  formData.append(
    "utr",
    utr
  );

  formData.append(
    "photo",
    file
  );

  formData.append(
    "account",
    currentID
  );

  formData.append(
    "amount",
    currentPrice
  );


  try {

    const response =
      await fetch(
        "/api/telegram",
        {
          method: "POST",
          body: formData
        }
      );


    if (!response.ok) {

      const text =
        await response.text();

      alert(
        "SERVER: " + text
      );

      return;

    }


    // ===========================
    // SAVE ORDER TO FIRESTORE
    // ===========================

    await addDoc(
      collection(db, "orders"),
      {

        uid: user.uid,

        email:
          user.email || "",

        account:
          currentID,

        amount:
          Number(currentPrice),

        phone:
          phone,

        utr:
          utr,

        status:
          "pending",

        createdAt:
          serverTimestamp()

      }
    );


    const success =
      document.getElementById(
        "success"
      );


    if (success)
      success.style.display =
        "block";


    alert(
      "Order successfully submit ho gaya."
    );


  } catch (error) {

    console.error(error);

    alert(
      "ERROR: " +
      error.message
    );

  }

};



// ===============================
// START
// ===============================

showPage(storePage);