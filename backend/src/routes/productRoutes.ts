import { Router } from "express";
import {
  addProduct,
  confirmOrderPayment,
  createOrder,
  createRazorpayOrder,
  deleteProduct,
  downloadCustomerOrderInvoice,
  downloadOrderInvoice,
  generateAdminOrderInvoice,
  getAdminOrders,
  getMyOrders,
  getProducts,
  seedDemoProducts,
  suggestPrice,
  updateAdminOrderStatus,
  uploadProductImage,
  verifyRazorpayPayment,
} from "../controllers/productController.js";
import { adminAuth, userAuth } from "../middlewares/authMiddleware.js";

const productRoutes = Router();

productRoutes.get("/products", getProducts);
// Issue #3 Fix: createOrder had no auth middleware — anyone could create orders for any userId.
// Now requires userAuth so userId comes from the verified JWT, not the request body.
productRoutes.post("/orders", userAuth, createOrder);
productRoutes.get("/orders/my", userAuth, getMyOrders);
productRoutes.get("/orders/my/invoice/:orderId", userAuth, downloadCustomerOrderInvoice);
productRoutes.post("/orders/:orderId/razorpay", userAuth, createRazorpayOrder);
productRoutes.post("/orders/:orderId/razorpay/verify", userAuth, verifyRazorpayPayment);

productRoutes.get("/admin/orders", adminAuth, getAdminOrders);
productRoutes.patch("/admin/orders/:id", adminAuth, updateAdminOrderStatus);
productRoutes.patch("/admin/orders/:id/confirm-payment", adminAuth, confirmOrderPayment);
productRoutes.post("/admin/orders/:id/generate-invoice", adminAuth, generateAdminOrderInvoice);
productRoutes.get("/docs/order-invoice/:orderId", adminAuth, downloadOrderInvoice);

productRoutes.post("/admin/upload-image", adminAuth, uploadProductImage);
productRoutes.post("/admin/suggest-price", adminAuth, suggestPrice);
productRoutes.post("/admin/add-product", adminAuth, addProduct);
productRoutes.post("/admin/seed-demo-products", adminAuth, seedDemoProducts);
productRoutes.delete("/admin/delete-product/:id", adminAuth, deleteProduct);

export default productRoutes;
