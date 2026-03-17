import Razorpay from "razorpay";

export const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
export const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || "";

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn("⚠️ Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.");
}

export const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});
