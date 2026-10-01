// ===============================
// SUMIT FF STORE - SIMPLE SCRIPT
// ===============================

const storePage = document.getElementById("storePage");
const paymentPage = document.getElementById("paymentPage");
const accountPage = document.getElementById("accountPage");

let currentID = "FF ID";
let currentPrice = 0;

// ---------- PAGE ----------

function showPage(page) {
  [storePage, paymentPage, accountPage].forEach(p => {
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

// ---------- BUY NOW ----------

window.buyNow = function (name, price) {

  currentID = name;
  currentPrice = price;

  const title = document.getElementById("payTitle");
  const amount = document.getElementById("payAmount");

  if (title) title.innerText = name;
  if (amount) amount.innerText = "₹" + price;

  showPage(paymentPage);
};

// ---------- UPI ----------

window.payUPI = function () {

  const upi = "YOURUPI@okicici";

  const url =
    `upi://pay?pa=${upi}` +
    `&pn=SumitFFStore` +
    `&am=${currentPrice}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(currentID)}`;

  window.location.href = url;
};

// ---------- SUBMIT ORDER ----------

window.submitOrder = async function () {

  const phone = document.getElementById("phone")?.value.trim();
  const utr = document.getElementById("utr")?.value.trim();
  const file = document.getElementById("shot")?.files[0];

  if (!phone || !/^[0-9]{10}$/.test(phone)) {
    alert("10 digit mobile number dalo.");
    return;
  }

  if (!utr || utr.length < 10) {
    alert("Valid UTR number dalo.");
    return;
  }

  if (!file) {
    alert("Payment screenshot upload karo.");
    return;
  }

  const formData = new FormData();

  formData.append("phone", phone);
  formData.append("utr", utr);
  formData.append("photo", file);
  formData.append("account", currentID);
  formData.append("amount", currentPrice);

  try {

    const response = await fetch("/api/telegram", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {

  const text = await response.text();
  alert("SERVER: " + text);

  return;
}

    document.getElementById("success").style.display = "block";

    alert("Order successfully submit ho gaya.");

  } catch (error) {

  console.error(error);

  alert("ERROR: " + error.message);

}
};

// ---------- SLIDER ----------

document.querySelectorAll(".slider").forEach(slider => {

  const slides = slider.querySelectorAll(".slide");
  const next = slider.querySelector(".right");
  const prev = slider.querySelector(".left");

  let index = 0;

  if (!slides.length) return;

  next?.addEventListener("click", () => {

    slides[index].classList.remove("show");

    index = (index + 1) % slides.length;

    slides[index].classList.add("show");

  });

  prev?.addEventListener("click", () => {

    slides[index].classList.remove("show");

    index = (index - 1 + slides.length) % slides.length;

    slides[index].classList.add("show");

  });

});

// ---------- START ----------

showPage(storePage);