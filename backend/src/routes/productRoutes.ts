import { Router } from "express";
import {
  addProduct,
  confirmOrderPayment,
  createOrder,
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
} from "../controllers/productController.js";
import { adminAuth, userAuth } from "../middlewares/authMiddleware.js";

const productRoutes = Router();

productRoutes.get("/products", getProducts);
productRoutes.post("/orders", createOrder);
productRoutes.get("/orders/my", userAuth, getMyOrders);
productRoutes.get("/orders/my/invoice/:orderId", userAuth, downloadCustomerOrderInvoice);

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
