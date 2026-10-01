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

    const [fields, files] = await form.parse(req);

    console.log("FIELDS:", fields);
    console.log("FILES:", files);
    
    const account = fields.account?.[0] || "";
    const utr = fields.utr?.[0] || "";
    const amount = fields.amount?.[0] || "";
    const phone = fields.phone?.[0] || "";

    const photo = files.photo?.[0];

    if (!account || !utr || !amount || !phone || !photo) {
    return res.status(400).json({
    error: "Required data missing"
  });
}

    const message =
`🛒 NEW FF ID ORDER

🎮 FF ID: ${account}
💰 Amount: ₹${amount}
📱 Mobile: ${phone}

🔢 UTR: ${utr}

⏳ Payment screenshot attached.`;

    // Send order details
    const tgMessage = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message
        })
      }
    );

    if (!tgMessage.ok) {
      return res.status(500).json({
        error: "Telegram message failed"
      });
    }

    // Send payment screenshot
    const photoData = new FormData();

    photoData.append("chat_id", CHAT_ID);

    photoData.append(
      "photo",
      new Blob(
        [fs.readFileSync(photo.filepath)],
        {
          type: photo.mimetype || "image/jpeg"
        }
      ),
      photo.originalFilename || "payment.jpg"
    );

    const tgPhoto = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: photoData
      }
    );

    if (!tgPhoto.ok) {
      return res.status(500).json({
        error: "Screenshot send failed"
      });
    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {

  console.error("ORDER ERROR:", error);

  return res.status(500).json({
    error: error.message
  });
}