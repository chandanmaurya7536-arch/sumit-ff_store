export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const q = req.query || {};
  const order = {
    mode: q.mode === "approved" ? "approved" : "rejected",
    account: String(q.account || ""),
    amount: String(q.amount || ""),
    phone: String(q.phone || ""),
    utr: String(q.utr || ""),
    orderId: String(q.orderId || "")
  };

  const safeOrder = JSON.stringify(order).replace(/</g, "\\u003c");

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  return res.status(200).send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sumit FF Store — Order Message</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:18px;background:#101116;color:#f5f5f5;font-family:Arial,sans-serif}
main{max-width:560px;margin:16px auto;padding:20px;border-radius:16px;background:#1b1d25;border:1px solid #343744}
h2{margin-top:0;font-size:22px}p{color:#c2c5d0;line-height:1.5;font-size:14px}
label{display:block;margin:14px 0 6px;color:#d5d7df}
input,textarea{width:100%;padding:12px;border:1px solid #454958;border-radius:9px;background:#111319;color:#fff;font:15px Arial,sans-serif}
textarea{min-height:390px;resize:vertical;line-height:1.5}
button,a{display:block;width:100%;padding:14px;margin-top:12px;border:0;border-radius:9px;text-align:center;text-decoration:none;font-weight:bold;font-size:15px;cursor:pointer}
#copy{background:#f2c14e;color:#171717}#whatsapp{background:#20c767;color:#07190d}
#status{min-height:20px;color:#9fe4ad}
</style>
</head>
<body>
<main>
<h2 id="heading">Order Message</h2>
<p>Copy button sirf message copy karega. Neeche WhatsApp button alag hai aur message mein copy nahi hoga.</p>
<section id="credentials" hidden>
<label for="googleId">Google ID / Email</label>
<input id="googleId" autocomplete="off" placeholder="nitishkumar138825@gmail.com">
<label for="googlePass">Password</label>
<input id="googlePass" autocomplete="off" placeholder="idforsell121199mm">
</section>
<label for="message">Message to copy</label>
<textarea id="message" readonly></textarea>
<button id="copy" type="button">📋 COPY FULL MESSAGE</button>
<a id="whatsapp" href="#" target="_blank" rel="noopener noreferrer">🟢 CLICK TO MESSAGE CUSTOMER ON WHATSAPP</a>
<p id="status" role="status"></p>
</main>
<script>
const order = ${safeOrder};
const $ = (id) => document.getElementById(id);
const approved = order.mode === "approved";
$("heading").textContent = approved ? "🟢 Approved — Delivery Message" : "🔴 Rejected — Payment Message";
$("credentials").hidden = !approved;

function orderDetails(statusText) {
  return "🛒 FF ID ORDER\\n\\n" +
    "🎮 FF ID: " + order.account + "\\n" +
    "💰 Amount: ₹" + order.amount + "\\n" +
    "📱 Mobile: " + order.phone + "\\n\\n" +
    "🔢 UTR: " + order.utr + "\\n\\n" +
    statusText + "\\n\\n" +
    "🆔 Order ID:\\n" + order.orderId + "\\n\\n";
}

function buildMessage() {
  if (approved) {
    return "Dear Customer,\\n\\n" +
      "Your Free Fire account has been successfully delivered. Please find your login credentials below:\\n\\n" +
      orderDetails("🟢 PAYMENT VERIFIED") +
      "Google id \\n\\n" +
      "Id - " + $("googleId").value.trim() + "\\n" +
      "Pass - " + $("googlePass").value + "\\n\\n" +
      "🎮 Free Fire ID Delivered Successfully!\\n\\n\\n" +
      "Please log in and verify your account details. For your security, we recommend changing the password after logging in, if supported.\\n\\n" +
      "Thank you for choosing Sumit FF Store! ❤️\\n\\n" +
      "We appreciate your trust and support. Enjoy your gaming experience! 🔥";
  }

  return orderDetails("🔴 PAYMENT REJECTED") +
    "⚠️ PAYMENT VERIFICATION FAILED\\n\\n" +
    "Hello Customer,\\n\\n" +
    "Aapke order ki payment verification ke dauran diya gaya UTR verify nahi ho saka. Isliye aapka order REJECTED kar diya gaya hai.\\n\\n" +
    "Kripya dhyan dein: Sirf payment screenshot ya UTR submit karna payment ka proof nahi hai. Order tabhi approve hoga jab amount hamare account mein successfully receive aur verify ho jayega.\\n\\n" +
    "Agar aapne sach mein payment ki hai, toh apni payment app mein transaction status check karein aur valid transaction proof share karein.\\n\\n" +
    "❌ Fake payment proof submit karke order approve karwane ki koshish na karein.\\n\\n" +
    "SUMIT FF STORE — Orders are processed only after payment verification.";
}

function refreshMessage() {
  $("message").value = buildMessage();
}
$("googleId").addEventListener("input", refreshMessage);
$("googlePass").addEventListener("input", refreshMessage);
refreshMessage();

$("copy").addEventListener("click", async () => {
  refreshMessage();
  if (approved && (!$("googleId").value.trim() || !$("googlePass").value)) {
    $("status").textContent = "Pehle Google ID aur password bharo.";
    return;
  }
  try {
    await navigator.clipboard.writeText($("message").value);
    $("status").textContent = "✅ Message copied. WhatsApp button se chat kholo aur paste karo.";
  } catch {
    $("message").focus();
    $("message").select();
    const ok = document.execCommand("copy");
    $("status").textContent = ok ? "✅ Message copied." : "Message select ho gaya. Copy option use karo.";
  }
});

function getIndianWhatsAppNumber(value) {
  const number = String(value || "").replace(/\\D/g, "");
  if (/^[6-9]\\d{9}$/.test(number)) return "91" + number;
  if (/^91[6-9]\\d{9}$/.test(number)) return number;
  if (/^0[6-9]\\d{9}$/.test(number)) return "91" + number.slice(1);
  return "";
}

const phone = getIndianWhatsAppNumber(order.phone);
if (phone) {
  $("whatsapp").href = "https://wa.me/" + phone;
} else {
  $("whatsapp").removeAttribute("href");
  $("whatsapp").textContent = "⚠️ Valid Indian mobile number not found";
  $("whatsapp").style.opacity = ".65";
  $("whatsapp").addEventListener("click", e => e.preventDefault());
}
</script>
</body>
</html>`);
}
