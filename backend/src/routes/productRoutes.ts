import { Router } from "express";
import {
  addProduct,
  createOrder,
  deleteProduct,
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

const productRoutes = Router();

productRoutes.get("/products", getProducts);
productRoutes.post("/orders", createOrder);
productRoutes.get("/orders/my", getMyOrders);

productRoutes.get("/admin/orders", getAdminOrders);
productRoutes.patch("/admin/orders/:id", updateAdminOrderStatus);
productRoutes.post("/admin/orders/:id/generate-invoice", generateAdminOrderInvoice);
productRoutes.get("/docs/order-invoice/:orderId", downloadOrderInvoice);

productRoutes.post("/admin/upload-image", uploadProductImage);
productRoutes.post("/admin/suggest-price", suggestPrice);
productRoutes.post("/admin/add-product", addProduct);
productRoutes.post("/admin/seed-demo-products", seedDemoProducts);
productRoutes.delete("/admin/delete-product/:id", deleteProduct);

export default productRoutes;
