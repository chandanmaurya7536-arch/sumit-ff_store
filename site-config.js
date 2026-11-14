/* =========================================================
   SUMIT FF STORE — 6 SITE PAYMENT SETTINGS
   Sites 1-3 preserved; Sites 4-6 added.
========================================================= */
(function () {
  const SITE_CONFIGS = {
    // SITE 1 CHANDU — unchanged
    "sumit-ffstore-chi.vercel.app": {
      siteId: "1",
      upiId: "sumitchaudhary90910@oksbi",
      qrPath: "assets/qr.png"
    },

    // SITE 1 — Custom domains — unchanged
    "digitalcraftzone.store": {
      siteId: "1",
      upiId: "sumitchaudhary90910@oksbi",
      qrPath: "assets/qr.png"
    },

    "www.digitalcraftzone.store": {
      siteId: "1",
      upiId: "sumitchaudhary90910@oksbi",
      qrPath: "assets/qr.png"
    },

    // SITE 2 AMIR — unchanged
    "sumit-ffstore-one.vercel.app": {
      siteId: "2",
      upiId: "amirkhan9518@naviaxis",
      qrPath: "assets/qr2.png"
    },

    // SITE 3 VKKASH — unchanged
    "sumit-ffstore-po3o.vercel.app": {
      siteId: "3",
      upiId: "sumitchaudhary90910@oksbi",
      qrPath: "assets/qr3.png"
    },

    // SITE 4 SONU — replace UPI placeholder with actual UPI ID
    "sumit-ffstore-three.vercel.app": {
      siteId: "4",
      upiId: "sonuxjk@fam",
      qrPath: "assets/qr4.png"
    },

    // SITE 5 SATISH — replace UPI placeholder with actual UPI ID
    "sumit-ffstore-ebon.vercel.app": {
      siteId: "5",
      upiId: "satishxjk@fam",
      qrPath: "assets/qr5.png"
    },

    // SITE 6 ANKIT — replace UPI placeholder with actual UPI ID
    "ankit-ffstore.vercel.app": {
      siteId: "6",
      upiId: "ADD_ANKIT_UPI_ID",
      qrPath: "assets/qr6.png"
    }
  };

  const host = String(window.location.hostname || "").toLowerCase();

  const isLocalPreview =
    !host ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "file";

  window.SUMIT_FF_SITE_CONFIG =
    SITE_CONFIGS[host] ||
    (isLocalPreview
      ? SITE_CONFIGS["sumit-ffstore-chi.vercel.app"]
      : null);
})();
