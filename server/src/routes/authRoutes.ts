import express from "express";
import { registerController } from "../modules/user/controllers/registerController";
import loginController from "../modules/user/controllers/loginController";
import { requestNewVerificationLinkController } from "../modules/user/controllers/requestNewVerificationLinkController";
import resetPasswordController from "../modules/user/controllers/resetPasswordController";
import forgotPasswordController from "../modules/user/controllers/forgotPasswordController";
import verifyResetTokenController  from "../modules/user/controllers/verifyResetTokenController";
import verifyEmailController from "../modules/user/controllers/verifyEmailController";
import googleLoginController from "../modules/user/controllers/googleLoginController";

const authRouter = express.Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);
authRouter.post('/google-login', googleLoginController);
authRouter.get("/verify", verifyEmailController);
authRouter.post("/request-new-verification-link", requestNewVerificationLinkController);
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.get("/verify-reset-token", verifyResetTokenController);
authRouter.post("/reset-password", resetPasswordController);

export default authRouter;

