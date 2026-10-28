
/* =========================================================
   SUMIT FF STORE — MULTI-DOMAIN PAYMENT SETTINGS
========================================================= */
(function () {
  const SITE_CONFIGS = {
    // SITE 1 — Vercel domain
    "sumit-ffstore-kv23.vercel.app: {
      upiId: "sumitchaudhary90910@oksbi",
      qrPath: "assets/qr.png"
    },

    // SITE 1 — Custom domain
    "digitalcraftzone.store": {
      upiId: "sumitchaudhary90910@oksbi",
      qrPath: "assets/qr.png"
    },

    "www.digitalcraftzone.store": {
      upiId: "sumitchaudhary90910@oksbi",
      qrPath: "assets/qr.png"
    },

    // SITE 2 — Keep unchanged
    "sumit-ffstore-lime.vercel.app": {
      upiId: "amirkhan9518@naviaxis",
      qrPath: "assets/qr2.png"
    },

    // SITE 3 — Keep unchanged
    "sumit-ffstore-po3o.vercel.app": {
      upiId: "sumitchaudhary90910@oksbi",
      qrPath: "assets/qr3.png"
    }
  };

  const host = String(window.location.hostname || "")
    .toLowerCase();

  // Local preview fallback only
  const isLocalPreview =
    !host ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "file";

  window.SUMIT_FF_SITE_CONFIG =
    SITE_CONFIGS[host] ||
    (isLocalPreview
      ? SITE_CONFIGS["sumit-ffstore-tau.vercel.app"]
      : null);
})();
