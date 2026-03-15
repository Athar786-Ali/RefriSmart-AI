import { Router } from "express";
import {
  bookService,
  cancelBooking,
  createBooking,
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
  verifyBookingOtp,
} from "../controllers/adminController.js";
import { adminAuth, userAuth } from "../middlewares/authMiddleware.js";

const adminRoutes = Router();

adminRoutes.get("/history/:userId", userAuth, getHistory);

adminRoutes.get("/booking/slots", getBookingSlots);
adminRoutes.post("/booking/create", createBooking);
adminRoutes.post("/service/book", bookService);
adminRoutes.patch("/booking/:id/status", adminAuth, updateBookingStatus);
adminRoutes.patch("/booking/:id/reschedule", adminAuth, rescheduleBooking);
adminRoutes.patch("/booking/:id/cancel", adminAuth, cancelBooking);
adminRoutes.get("/booking/timeline/:bookingId", userAuth, getBookingTimeline);
adminRoutes.post("/booking/:id/send-otp", adminAuth, sendBookingOtp);
adminRoutes.post("/booking/:id/verify-otp", adminAuth, verifyBookingOtp);
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
adminRoutes.post("/sell/offers/:id/respond", respondSellOffer);
adminRoutes.post("/sell/requests/:id/move-to-refurbished", adminAuth, moveSellRequestToRefurbished);

adminRoutes.get("/ops/analytics", adminAuth, getOpsAnalytics);
adminRoutes.get("/admin/service-overview", adminAuth, getAdminServiceOverview);
adminRoutes.get("/admin/all-diagnoses", adminAuth, getAllDiagnoses);
adminRoutes.get("/admin/stats-basic", adminAuth, getStatsBasic);
adminRoutes.get("/admin/stats", adminAuth, getStats);

adminRoutes.post("/docs/:docType", adminAuth, generateDocument);
adminRoutes.get("/docs/invoice/:bookingId", adminAuth, generateInvoiceByBooking);

export default adminRoutes;
