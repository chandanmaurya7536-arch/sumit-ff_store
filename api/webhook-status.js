import formidable from "formidable";
import fs from "fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    })
  });
}
const db = getFirestore();

export const config = {
  api: {
    bodyParser: false
  }
};


export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }


  const site = String(process.env.TELEGRAM_SITE || "1");
  const BOT_TOKEN = site === "2"
    ? process.env.BOT_TOKEN_SITE2
    : site === "3"
      ? process.env.BOT_TOKEN_SITE3
      : process.env.BOT_TOKEN;
  const CHAT_ID = site === "2"
    ? (process.env.CHAT_ID_SITE2 || process.env.CHAT_ID)
    : site === "3"
      ? (process.env.CHAT_ID_SITE3 || process.env.CHAT_ID)
      : process.env.CHAT_ID;


  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({
      error: "Telegram settings missing"
    });
  }


  const form = formidable({
    multiples: false,
    keepExtensions: true
  });


  try {

    // ===================================
    // READ FORM
    // ===================================

    const { fields, files } =
      await new Promise(
        (resolve, reject) => {

          form.parse(
            req,
            (err, fields, files) => {

              if (err) {
                reject(err);
                return;
              }

              resolve({
                fields,
                files
              });
            }
          );
        }
      );


    const account =
      fields.account?.[0] ||
      fields.account ||
      "";

    const utr =
      fields.utr?.[0] ||
      fields.utr ||
      "";

    const amount =
      fields.amount?.[0] ||
      fields.amount ||
      "";

    const phone =
      fields.phone?.[0] ||
      fields.phone ||
      "";

    const orderId =
      fields.orderId?.[0] ||
      fields.orderId ||
      "";


    const photo =
      Array.isArray(files.photo)
        ? files.photo[0]
        : files.photo;


    // ===================================
    // VALIDATION
    // ===================================

    if (
      !account ||
      !utr ||
      !amount ||
      !phone ||
      !orderId ||
      !photo
    ) {

      return res.status(400).json({
        error:
          "Required payment data missing"
      });
    }


    // ===================================
    // ORDER MESSAGE
    // ===================================

    const message =
`🛒 NEW FF ID ORDER

🎮 FF ID: ${account}
💰 Amount: ₹${amount}
📱 Mobile: ${phone}

🔢 UTR: ${utr}

🟡 STATUS: UNDER VERIFICATION

⏱️ Auto reject after 3 hours if not approved.

🆔 Order ID:
${orderId}`;


    // Save the order in Firestore using the same ID used by Telegram buttons.
    // This ensures the callback handler can find and update it.
    const orderDocId = String(orderId).trim();
    if (!orderDocId || orderDocId.includes("/")) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const orderRef = db.collection("orders").doc(orderDocId);
    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(orderRef);
      const orderData = {
        account: String(account),
        amount: String(amount),
        phone: String(phone),
        utr: String(utr),
        orderId: orderDocId,
        updatedAt: Timestamp.now()
      };
      if (!existing.exists) {
        orderData.status = "pending";
        orderData.createdAt = Timestamp.now();
      }
      transaction.set(orderRef, orderData, { merge: true });
    });


    // ===================================
    // TELEGRAM BUTTONS
    // ===================================

    const keyboard = {

      inline_keyboard: [

        [
          {
            text:
              "🟡 UNDER VERIFICATION",

            callback_data:
              `status:${orderId}:pending`
          }
        ],

        [
          {
            text:
              "🟢 APPROVE",

            callback_data:
              `status:${orderId}:approved`
          },

          {
            text:
              "🔴 REJECT",

            callback_data:
              `status:${orderId}:rejected`
          }
        ],

        [
          {
            text:
              "📦 DELIVERED",

            callback_data:
              `status:${orderId}:delivered`
          }
        ]

      ]
    };


    // ===================================
    // SEND ORDER MESSAGE
    // ===================================

    const messageResponse =
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            chat_id:
              CHAT_ID,

            text:
              message,

            reply_markup:
              keyboard

          })
        }
      );


    const messageData =
      await messageResponse.json();


    if (
      !messageResponse.ok ||
      !messageData.ok
    ) {

      console.error(
        "TELEGRAM MESSAGE ERROR:",
        messageData
      );

      return res.status(500).json({
        error:
          messageData.description ||
          "Telegram message failed"
      });
    }


    // ===================================
    // READ SCREENSHOT
    // ===================================

    const fileBuffer =
      fs.readFileSync(
        photo.filepath
      );


    const formData =
      new FormData();


    formData.append(
      "chat_id",
      CHAT_ID
    );


    formData.append(
      "caption",
      `🧾 Payment Screenshot\n\n🆔 Order: ${orderId}`
    );


    formData.append(
      "photo",

      new Blob(
        [
          fileBuffer
        ],
        {
          type:
            photo.mimetype ||
            "image/jpeg"
        }
      ),

      photo.originalFilename ||
      "payment.jpg"
    );


    // ===================================
    // SEND SCREENSHOT
    // ===================================

    const photoResponse =
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
        {
          method: "POST",
          body: formData
        }
      );


    const photoData =
      await photoResponse.json();


    if (
      !photoResponse.ok ||
      !photoData.ok
    ) {

      console.error(
        "TELEGRAM PHOTO ERROR:",
        photoData
      );

      return res.status(500).json({
        error:
          photoData.description ||
          "Payment screenshot failed"
      });
    }


    // ===================================
    // SUCCESS
    // ===================================

    return res.status(200).json({

      success: true,

      orderId,

      messageId:
        messageData.result?.message_id ||
        null,

      photoMessageId:
        photoData.result?.message_id ||
        null

    });


  } catch (error) {

    console.error(
      "TELEGRAM ORDER ERROR:",
      error
    );


    return res.status(500).json({
      error:
        error?.message ||
        "Order submission failed"
    });
  }
}