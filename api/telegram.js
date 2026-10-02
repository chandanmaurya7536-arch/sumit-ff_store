import formidable from "formidable";
import fs from "fs";

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

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

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

    const { fields, files } = await new Promise(
      (resolve, reject) => {

        form.parse(req, (err, fields, files) => {

          if (err) {
            reject(err);
          } else {
            resolve({
              fields,
              files
            });
          }

        });

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


    if (
      !account ||
      !utr ||
      !amount ||
      !phone ||
      !orderId ||
      !photo
    ) {
      return res.status(400).json({
        error: "Required data missing"
      });
    }


    // =====================================
    // TELEGRAM ORDER MESSAGE
    // =====================================

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


    // =====================================
    // FOUR BUTTONS
    // =====================================

    const keyboard = {
      inline_keyboard: [

        [
          {
            text: "🟡 UNDER VERIFICATION",
            callback_data: `status:${orderId}:pending`
          }
        ],

        [
          {
            text: "🟢 APPROVE",
            callback_data: `status:${orderId}:approved`
          },

          {
            text: "🔴 REJECT",
            callback_data: `status:${orderId}:rejected`
          }
        ],

        [
          {
            text: "📦 DELIVERED",
            callback_data: `status:${orderId}:delivered`
          }
        ]

      ]
    };


    // =====================================
    // SEND MESSAGE
    // =====================================

    const tgMessage = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          chat_id: CHAT_ID,

          text: message,

          reply_markup: keyboard

        })
      }
    );


    if (!tgMessage.ok) {

      const errorText =
        await tgMessage.text();

      return res.status(500).json({
        error: errorText
      });

    }


    const messageData =
      await tgMessage.json();


    // =====================================
    // SEND PAYMENT SCREENSHOT
    // =====================================

    const photoData =
      new FormData();

    photoData.append(
      "chat_id",
      CHAT_ID
    );

    photoData.append(
      "caption",
      `🧾 Payment Screenshot\n\n🆔 Order: ${orderId}`
    );

    photoData.append(
      "photo",

      new Blob(
        [
          fs.readFileSync(
            photo.filepath
          )
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


    const tgPhoto = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: photoData
      }
    );


    if (!tgPhoto.ok) {

      const errorText =
        await tgPhoto.text();

      return res.status(500).json({
        error: errorText
      });

    }


    // =====================================
    // RETURN TELEGRAM MESSAGE ID
    // =====================================

    return res.status(200).json({

      success: true,

      messageId:
        messageData.result?.message_id || null,

      chatId:
        CHAT_ID

    });


  } catch (error) {

    console.error(
      "TELEGRAM ORDER ERROR:",
      error
    );

    return res.status(500).json({
      error: error.message
    });

  }

}