import { Navigate, Route, Routes } from "react-router-dom";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import HomePage from "../pages/home/HomePage";
import NotFoundPage from "../pages/not-found/NotFoundPage";
import UserProfilePage from "../pages/user/UserProfilePage";
import UserSettingsPage from "../pages/user/UserSettingsPage";

import ProtectedRoute from "../components/layout/ProtectedRoute";

const AppRoutes = ({ isAuthenticated }) => {
	return (
		<Routes>
			{/* Auth Routes */}
			<Route
				path="/login"
				element={
					isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />
				}
			/>
			<Route
				path="/register"
				element={
					isAuthenticated ? <Navigate to="/home" replace /> : <RegisterPage />
				}
			/>
			<Route
				path="/forgot-password"
				element={
					isAuthenticated ? (
						<Navigate to="/home" replace />
					) : (
						<ForgotPasswordPage />
					)
				}
			/>
			<Route
				path="/reset-password/:token"
				element={
					isAuthenticated ? (
						<Navigate to="/home" replace />
					) : (
						<ResetPasswordPage />
					)
				}
			/>

			{/* Protected Routes */}
			<Route element={<ProtectedRoute />}>
				<Route path="/home" element={<HomePage />} />
				<Route path="/profile" element={<UserProfilePage />} />
				<Route path="/settings" element={<UserSettingsPage />} />
			</Route>

			{/* Redirect Routes */}
			<Route
				path="/"
				element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />}
			/>

			{/* Not Found Route */}
			<Route path="*" element={<NotFoundPage />} />
		</Routes>
	);
};

export default AppRoutes;
