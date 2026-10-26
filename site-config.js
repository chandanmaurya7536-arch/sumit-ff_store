/* =========================================================
SUMIT FF STORE — MULTI-DOMAIN PAYMENT SETTINGS
========================================================= */
(function () {
const SITE_CONFIGS = {
"sumit-ffstore-tau.vercel.app": {
upiId: "sumitchaudhary90910@oksbi",
qrPath: "assets/qr.png"
},

"sumit-ffstore-lime.vercel.app": {
  upiId: "amirkhan9518@naviaxis",
  qrPath: "assets/qr2.png"
},

// THIRD DOMAIN — fill these two placeholders when ready.
// Do not use this placeholder hostname as a real domain.
"sumit-ffstore-po3o.vercel.app": {
  upiId: "sumitchaudhary90910@oksbi",
  qrPath: "assets/qr3.png"
}

};

const host = String(window.location.hostname || "").toLowerCase();

// For local file/MT Manager preview only, use the first site's payment details.
const isLocalPreview = !host || host === "localhost" || host === "127.0.0.1";
window.SUMIT_FF_SITE_CONFIG = SITE_CONFIGS[host] || (isLocalPreview ? SITE_CONFIGS["sumit-ffstore-tau.vercel.app"] : null);
})();