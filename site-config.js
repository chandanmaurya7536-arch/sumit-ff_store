/* =========================================================
SUMIT FF STORE — MULTI-DOMAIN PAYMENT SETTINGS
========================================================= */
(function () {
const SITE_CONFIGS = {
"sumit-ffstore-rust.vercel.app": {
upiId: "sumitchaudhary90910@oksbi",
qrPath: "assets/qr.png"
},

"sumit-ffstore-five.vercel.app": {
  upiId: "amirkhan9518@naviaxis",
  qrPath: "assets/qr2.png"
},

// THIRD DOMAIN — fill these two placeholders when ready.
// Do not use this placeholder hostname as a real domain.
"THIRD_DOMAIN_HERE": {
  upiId: "THIRD_UPI_ID_HERE",
  qrPath: "assets/qr3.png"
}

};

const host = String(window.location.hostname || "").toLowerCase();

window.SUMIT_FF_SITE_CONFIG = SITE_CONFIGS[host] || null;
})();