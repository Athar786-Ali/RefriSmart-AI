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

const adminRoutes = Router();

adminRoutes.get("/history/:userId", getHistory);

adminRoutes.get("/booking/slots", getBookingSlots);
adminRoutes.post("/booking/create", createBooking);
adminRoutes.post("/service/book", bookService);
adminRoutes.patch("/booking/:id/status", updateBookingStatus);
adminRoutes.patch("/booking/:id/reschedule", rescheduleBooking);
adminRoutes.patch("/booking/:id/cancel", cancelBooking);
adminRoutes.get("/booking/timeline/:bookingId", getBookingTimeline);
adminRoutes.post("/booking/:id/send-otp", sendBookingOtp);
adminRoutes.post("/booking/:id/verify-otp", verifyBookingOtp);
adminRoutes.get("/booking/:id/reminders", getBookingReminders);

adminRoutes.get("/service/my-bookings/:userId", getMyBookingsByPath);
adminRoutes.get("/service/my-bookings", getMyBookingsByQuery);
adminRoutes.patch("/admin/service/:id", updateAdminService);
adminRoutes.post("/service/:id/rating", saveServiceRating);

adminRoutes.post("/admin/gallery", uploadGalleryItem);
adminRoutes.get("/gallery", getGallery);
adminRoutes.delete("/admin/gallery/:id", deleteGalleryItem);

adminRoutes.get("/technician/jobs", getTechnicianJobs);
adminRoutes.patch("/technician/jobs/:bookingId/status", updateTechnicianJobStatus);

adminRoutes.post("/sell/request", createSellRequest);
adminRoutes.get("/sell/requests", getSellRequests);
adminRoutes.post("/sell/requests/:id/offer", sendSellOffer);
adminRoutes.post("/sell/offers/:id/respond", respondSellOffer);
adminRoutes.post("/sell/requests/:id/move-to-refurbished", moveSellRequestToRefurbished);

adminRoutes.get("/ops/analytics", getOpsAnalytics);
adminRoutes.get("/admin/service-overview", getAdminServiceOverview);
adminRoutes.get("/admin/all-diagnoses", getAllDiagnoses);
adminRoutes.get("/admin/stats-basic", getStatsBasic);
adminRoutes.get("/admin/stats", getStats);

adminRoutes.post("/docs/:docType", generateDocument);
adminRoutes.get("/docs/invoice/:bookingId", generateInvoiceByBooking);

export default adminRoutes;
