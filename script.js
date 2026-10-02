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
  onSnapshot,
  serverTimestamp
} from "./firebase.js";

const storePage = document.getElementById("storePage");
const paymentPage = document.getElementById("paymentPage");
const accountPage = document.getElementById("accountPage");
const purchasesPage = document.getElementById("purchasesPage");
const historyPage = document.getElementById("historyPage");

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
    purchasesPage,
    historyPage
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

    showPopup(
  "Login Required",
  "Please login to view your purchases.",
  "info",
  "🔐"
);

    openAccount();

    return;

  }

   // ===============================
// HISTORY
// ===============================

window.openHistory = function() {

  const user = auth.currentUser;

  if (!user) {
    showPopup(
  "Login Required",
  "Please login to view your order history.",
  "info",
  "🔐"
);
    openAccount();
    return;
  }

  showPage(historyPage);
  loadHistory(user.uid);

};


// ===============================
// LOAD FULL HISTORY
// ===============================

function loadHistory(uid) {

  const loading =
    document.getElementById("historyLoading");

  const empty =
    document.getElementById("historyEmpty");

  const list =
    document.getElementById("historyList");

  if (!loading || !empty || !list)
    return;

  loading.style.display = "block";
  empty.style.display = "none";
  list.innerHTML = "";

  const ordersRef =
    collection(db, "orders");

  const q = query(
    ordersRef,
    where("uid", "==", uid)
  );

  onSnapshot(q, (snapshot) => {

    loading.style.display = "none";
    list.innerHTML = "";

    if (snapshot.empty) {
      empty.style.display = "block";
      return;
    }

    empty.style.display = "none";

    const docs = [...snapshot.docs];

    docs.sort((a, b) => {

      const aTime =
        a.data().createdAt?.toMillis?.() || 0;

      const bTime =
        b.data().createdAt?.toMillis?.() || 0;

      return bTime - aTime;

    });

    docs.forEach((docSnap) => {

      const order = docSnap.data();

      const status =
        String(order.status || "pending")
        .toLowerCase();

      let statusClass = "status-pending";

      let statusText = "UNDER VERIFICATION";

      if (status === "approved") {
        statusClass = "status-approved";
        statusText = "PAYMENT VERIFIED";
      }

      if (status === "rejected") {
        statusClass = "status-rejected";
        statusText = "PAYMENT REJECTED";
      }

      if (status === "delivered") {
        statusClass = "status-delivered";
        statusText = "ID DELIVERED";
      }

      let date = "Date unavailable";

      if (order.createdAt?.toDate) {

        date =
          order.createdAt
          .toDate()
          .toLocaleString("en-IN");

      }

      const card =
        document.createElement("div");

      card.className = "premium-order-card";

      card.innerHTML = `

        <div class="order-card-top">

          <div>
            <div class="order-label">
              FREE FIRE ACCOUNT
            </div>

            <div class="order-account">
              ${order.account || "FF ID"}
            </div>
          </div>

          <div class="premium-status ${statusClass}">
            ${statusText}
          </div>

        </div>

        <div class="order-amount">
          ₹${order.amount || 0}
        </div>

        <div class="order-details">

          <div>
            <span>📱</span>
            Mobile
            <strong>${order.phone || "Not available"}</strong>
          </div>

          <div>
            <span>🔢</span>
            UTR
            <strong>
              ${
                order.utr
                ? "••••••" + String(order.utr).slice(-6)
                : "Not available"
              }
            </strong>
          </div>

          <div>
            <span>📅</span>
            Order Date
            <strong>${date}</strong>
          </div>

        </div>

      `;

      list.appendChild(card);

    });

  }, (error) => {

    console.error("History error:", error);

    loading.style.display = "none";

    list.innerHTML = `
      <div class="premium-error">
        Unable to load order history.
        <br>
        <small>${error.message}</small>
      </div>
    `;

  });

}

  showPage(purchasesPage);

  loadPurchases(user.uid);

};


// ===============================
// MY PURCHASES - APPROVED ONLY
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

  const ordersRef =
    collection(db, "orders");

  const q = query(
    ordersRef,
    where("uid", "==", uid)
  );

  if (purchasesUnsubscribe) {
    purchasesUnsubscribe();
    purchasesUnsubscribe = null;
  }

  purchasesUnsubscribe =
    onSnapshot(q, (snapshot) => {

      loading.style.display = "none";
      list.innerHTML = "";

      const approvedOrders =
        snapshot.docs
        .filter(docSnap => {

          const status =
            String(
              docSnap.data().status || ""
            ).toLowerCase();

          return (
            status === "approved" ||
            status === "delivered"
          );

        })
        .sort((a, b) => {

          const aTime =
            a.data().createdAt?.toMillis?.() || 0;

          const bTime =
            b.data().createdAt?.toMillis?.() || 0;

          return bTime - aTime;

        });


      // =========================
      // NO APPROVED PURCHASE
      // =========================

      if (approvedOrders.length === 0) {

        empty.style.display = "block";

        empty.innerHTML = `

          <div class="empty-icon">
            🛍️
          </div>

          <h2>
            No Purchases Yet
          </h2>

          <p>
            Your purchased FF IDs will appear here
            after your payment is approved.
          </p>

          <div class="empty-note">
            🔐 Your current orders are under verification.
          </div>

        `;

        return;

      }


      empty.style.display = "none";


      // =========================
      // APPROVED PURCHASES
      // =========================

      approvedOrders.forEach((docSnap) => {

        const order = docSnap.data();

        const status =
          String(order.status || "")
          .toLowerCase();

        const statusClass =
          status === "delivered"
          ? "status-delivered"
          : "status-approved";

        const statusText =
          status === "delivered"
          ? "ID DELIVERED"
          : "PAYMENT VERIFIED";

        let date = "Date unavailable";

        if (order.createdAt?.toDate) {

          date =
            order.createdAt
            .toDate()
            .toLocaleString("en-IN");

        }

        const card =
          document.createElement("div");

        card.className =
          "premium-order-card purchased-card";

        card.innerHTML = `

          <div class="verified-line">
            ✓ VERIFIED PURCHASE
          </div>

          <div class="order-card-top">

            <div>

              <div class="order-label">
                FREE FIRE ACCOUNT
              </div>

              <div class="order-account">
                ${order.account || "FF ID"}
              </div>

            </div>

            <div class="premium-status ${statusClass}">
              ${statusText}
            </div>

          </div>

          <div class="order-amount">
            ₹${order.amount || 0}
          </div>

          <div class="purchase-message">

            🎮 Your payment has been verified.
            <br>

            Your FF ID is now confirmed as purchased.

          </div>

          <div class="order-details">

            <div>
              <span>📱</span>
              Mobile
              <strong>
                ${order.phone || "Not available"}
              </strong>
            </div>

            <div>
              <span>📅</span>
              Purchase Date
              <strong>${date}</strong>
            </div>

          </div>

        `;

        list.appendChild(card);

      });

    }, (error) => {

      console.error(
        "Purchases error:",
        error
      );

      loading.style.display = "none";

      list.innerHTML = `

        <div class="premium-error">

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
// SUBMIT ORDER - SMOOTH
// ===============================

window.submitOrder = async function() {

  const user = auth.currentUser;

  // LOGIN CHECK
  if (!user) {

    showPopup(
      "Login Required",
      "Please login before submitting your payment.",
      "info",
      "🔐"
    );

    openAccount();
    return;
  }


  const phone =
    document.getElementById("phone")?.value.trim();

  const utr =
    document.getElementById("utr")?.value.trim();

  const file =
    document.getElementById("shot")?.files[0];

  const submitBtn =
    document.getElementById("submitBtn");

  const sending =
    document.getElementById("sending");

  const sendingTitle =
    document.getElementById("sendingTitle");

  const sendingText =
    document.getElementById("sendingText");

  const success =
    document.getElementById("success");


  // ===========================
  // MOBILE VALIDATION
  // ===========================

  if (!phone || !/^[0-9]{10}$/.test(phone)) {

    showPopup(
      "Invalid Mobile Number",
      "Please enter a valid 10 digit mobile number.",
      "warning",
      "!"
    );

    return;
  }


  // ===========================
  // UTR VALIDATION
  // ===========================

  if (!utr || !/^[0-9]{12}$/.test(utr)) {

    showPopup(
      "Invalid UTR",
      "Please enter your 12 digit UTR number.",
      "warning",
      "!"
    );

    return;
  }


  // ===========================
  // SCREENSHOT VALIDATION
  // ===========================

  if (!file) {

    showPopup(
      "Screenshot Required",
      "Please upload your payment screenshot before submitting.",
      "warning",
      "📷"
    );

    return;
  }


  // ===========================
  // SHOW SENDING
  // ===========================

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.display = "none";
  }

  if (success) {
    success.style.display = "none";
  }

  if (sending) {
    sending.style.display = "block";
  }

  if (sendingTitle) {
    sendingTitle.innerText = "Sending...";
  }

  if (sendingText) {
    sendingText.innerText =
      "Payment details and screenshot are being sent.";
  }


  const formData = new FormData();

  formData.append("phone", phone);
  formData.append("utr", utr);
  formData.append("photo", file);
  formData.append("account", currentID);
  formData.append("amount", currentPrice);


  try {

    // ===========================
    // TELEGRAM
    // ===========================

    if (sendingTitle) {
      sendingTitle.innerText =
        "Sending to Telegram...";
    }

    if (sendingText) {
      sendingText.innerText =
        "Please wait while your payment proof is being uploaded.";
    }


    const response =
      await fetch("/api/telegram", {
        method: "POST",
        body: formData
      });


    if (!response.ok) {

      const text =
        await response.text();

      throw new Error(
        "Telegram server error: " + text
      );
    }


    // ===========================
    // FIRESTORE
    // ===========================

    if (sendingTitle) {
      sendingTitle.innerText =
        "Saving Order...";
    }

    if (sendingText) {
      sendingText.innerText =
        "Your order is being saved securely.";
    }


    await addDoc(
      collection(db, "orders"),
      {
        uid: user.uid,
        email: user.email || "",
        account: currentID,
        amount: Number(currentPrice),
        phone: phone,
        utr: utr,
        status: "pending",
        createdAt: serverTimestamp()
      }
    );


    // ===========================
    // SUCCESS
    // ===========================

    if (sending) {
      sending.style.display = "none";
    }

    if (success) {
      success.style.display = "block";
    }


    showPopup(
      "Payment Submitted",
      "Your payment details were submitted successfully and are now under verification.",
      "success",
      "✓"
    );


  } catch (error) {

    console.error(
      "ORDER ERROR:",
      error
    );


    // ===========================
    // ERROR
    // ===========================

    if (sending) {
      sending.style.display = "none";
    }

    if (submitBtn) {
      submitBtn.style.display = "block";
      submitBtn.disabled = false;
    }


    showPopup(
      "Something Went Wrong",
      error.message,
      "error",
      "×"
    );

  }

};


// ===============================
// START
// ===============================

showPage(storePage);