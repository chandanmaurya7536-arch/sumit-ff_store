export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    const form = await req.formData();

    const utr = form.get("utr");
    const phone = form.get("phone");
    const id = form.get("id");
    const amount = form.get("amount");
    const photo = form.get("photo");

    if (!phone || !utr || !id || !amount || !photo) {
      return res.status(400).json({
        error: "Missing payment details"
      });
    }

    const tg = new FormData();

    tg.append("chat_id", CHAT_ID);

    tg.append(
      "caption",
      `🔥 NEW PAYMENT

🎮 ID: ${id}
💰 Amount: ₹${amount}
📱 Mobile: ${phone}
🔢 UTR: ${utr}

⏳ PAYMENT VERIFICATION PENDING`
    );

    tg.append("photo", photo);

    const r = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: tg
      }
    );

    if (r.ok) {
      return res.status(200).json({ ok: true });
    }

    const error = await r.text();

    console.error("Telegram Error:", error);

    return res.status(500).json({
      error: "Telegram Error"
    });

  } catch (error) {

    console.error("Server Error:", error);

    return res.status(500).json({
      error: "Server Error"
    });
  }
}