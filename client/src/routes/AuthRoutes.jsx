import React from "react";
import { Route, Routes } from "react-router-dom";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import LoginPage from "../pages/LoginPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SignUpPage from "../pages/SignUpPage.jsx";

function AuthRoutes() {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/signup" element={<SignUpPage />} />
			<Route path="/forgotPassword" element={<ForgotPasswordPage />} />
			<Route path="/resetPassword/:token" element={<ResetPasswordPage />} />
		</Routes>
	);
}

export default AuthRoutes;
