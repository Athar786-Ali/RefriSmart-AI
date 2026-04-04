import { Router } from "express";
import {
  bookService,
  cancelServiceBooking,
  cancelBooking,
  confirmManualPayment,
  createBooking,
  createServiceRazorpayOrder,
  createSellRequest,
  deleteGalleryItem,
  generateDocument,
  generateInvoiceByBooking,
  getAdminServiceOverview,
  getAllDiagnoses,
  getBookingReminders,
  getBookingSlots,
  getBookingTimeline,
  getGallery,
  getHistory,
  getGuestBooking,
  getMyBookingsByPath,
  getMyBookingsByQuery,
  getOpsAnalytics,
  getSellRequests,
  getStats,
  getStatsBasic,
  getTechnicianJobs,
  moveSellRequestToRefurbished,
  rescheduleBooking,
  respondSellOffer,
  saveServiceRating,
  sendBookingOtp,
  sendSellOffer,
  updateAdminService,
  updateBookingStatus,
  updateTechnicianJobStatus,
  uploadGalleryItem,
  verifyServiceRazorpayPayment,
  verifyBookingOtp,
} from "../controllers/adminController.js";
import { adminAuth, userAuth } from "../middlewares/authMiddleware.js";

const adminRoutes = Router();

adminRoutes.get("/history/:userId", userAuth, getHistory);

adminRoutes.get("/booking/slots", getBookingSlots);
// Issue #6 Fix: createBooking was fully unauthenticated — any caller could pass
// any userId in the body and book under someone else's identity.
// Using userAuth as optional middleware; for logged-in users, userId is
// overridden from the JWT inside the controller so body userId is ignored.
adminRoutes.post("/booking/create", userAuth, createBooking);
adminRoutes.post("/service/book", bookService);
adminRoutes.patch("/booking/:id/status", adminAuth, updateBookingStatus);
adminRoutes.patch("/booking/:id/reschedule", adminAuth, rescheduleBooking);
// Fix #12: cancelBooking previously had NO auth middleware — any caller with a bookingId
// could cancel any booking. Restricted to adminAuth.
adminRoutes.patch("/booking/:id/cancel", adminAuth, cancelBooking);
adminRoutes.get("/booking/timeline/:bookingId", userAuth, getBookingTimeline);
adminRoutes.post("/booking/:id/send-otp", adminAuth, sendBookingOtp);
adminRoutes.post("/booking/:id/verify-otp", adminAuth, verifyBookingOtp);
adminRoutes.post("/booking/:id/razorpay", userAuth, createServiceRazorpayOrder);
adminRoutes.post("/booking/:id/razorpay/verify", userAuth, verifyServiceRazorpayPayment);
adminRoutes.post("/bookings/:bookingId/confirm-payment", userAuth, confirmManualPayment);
adminRoutes.post("/bookings/:bookingId/cancel", userAuth, cancelServiceBooking);
adminRoutes.get("/booking/:id/reminders", adminAuth, getBookingReminders);

adminRoutes.get("/service/my-bookings/:userId", userAuth, getMyBookingsByPath);
adminRoutes.get("/service/my-bookings", userAuth, getMyBookingsByQuery);
adminRoutes.get("/service/guest-booking", getGuestBooking);
adminRoutes.patch("/admin/service/:id", adminAuth, updateAdminService);
adminRoutes.post("/service/:id/rating", saveServiceRating);

adminRoutes.post("/admin/gallery", adminAuth, uploadGalleryItem);
adminRoutes.get("/gallery", getGallery);
adminRoutes.delete("/admin/gallery/:id", adminAuth, deleteGalleryItem);

adminRoutes.get("/technician/jobs", adminAuth, getTechnicianJobs);
adminRoutes.patch("/technician/jobs/:bookingId/status", adminAuth, updateTechnicianJobStatus);

adminRoutes.post("/sell/request", createSellRequest);
adminRoutes.get("/sell/requests", adminAuth, getSellRequests);
adminRoutes.post("/sell/requests/:id/offer", adminAuth, sendSellOffer);
// R2 Fix: respondSellOffer had NO auth — anyone could accept/reject any offer anonymously.
// This is customer-facing so userAuth is used (not adminAuth).
adminRoutes.post("/sell/offers/:id/respond", userAuth, respondSellOffer);
adminRoutes.post("/sell/requests/:id/move-to-refurbished", adminAuth, moveSellRequestToRefurbished);

adminRoutes.get("/ops/analytics", adminAuth, getOpsAnalytics);
adminRoutes.get("/admin/service-overview", adminAuth, getAdminServiceOverview);
adminRoutes.get("/admin/all-diagnoses", adminAuth, getAllDiagnoses);
adminRoutes.get("/admin/stats-basic", adminAuth, getStatsBasic);
adminRoutes.get("/admin/stats", adminAuth, getStats);

adminRoutes.post("/docs/:docType", adminAuth, generateDocument);
adminRoutes.get("/docs/invoice/:bookingId", adminAuth, generateInvoiceByBooking);

export default adminRoutes;
