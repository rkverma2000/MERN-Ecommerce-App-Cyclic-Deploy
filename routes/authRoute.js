import express from "express";
import { registerController, loginController, forgotPasswordController, updateProfileController, getOrdersController, getAdminOrdersController, orderStatusController } from "../controllers/authController.js";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/forgot-password", forgotPasswordController);

router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
});

router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
});

router.put('/update-profile', requireSignIn, updateProfileController);

router.get('/orders', requireSignIn, getOrdersController);

router.get('/admin-orders', requireSignIn, isAdmin, getAdminOrdersController);

router.put('/order-status/:orderId', requireSignIn, isAdmin, orderStatusController)

export default router; 