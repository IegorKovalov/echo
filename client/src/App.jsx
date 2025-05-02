import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { ToastProvider } from "./context/ToastContext";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import FriendsPage from "./pages/friends/FriendsPage";
import HomePage from "./pages/home/HomePage";
import NotFoundPage from "./pages/not-found/NotFoundPage";
import UserProfilePage from "./pages/user/UserProfilePage";
import UserSettingsPage from "./pages/user/UserSettingsPage";

import "./styles";

function App() {
	const auth = useAuth();
	const isAuthenticated = auth ? auth.isAuthenticated() : false;

	return (
		<Router>
			<ToastProvider>
				<ProfileProvider>
					<Routes>
						{/* Auth Routes with Auth Layout */}
						<Route element={<AuthLayout />}>
							<Route
								path="/login"
								element={
									isAuthenticated ? <Navigate to="/home" /> : <LoginPage />
								}
							/>
							<Route
								path="/register"
								element={
									isAuthenticated ? <Navigate to="/home" /> : <RegisterPage />
								}
							/>
							<Route
								path="/forgot-password"
								element={
									isAuthenticated ? (
										<Navigate to="/home" />
									) : (
										<ForgotPasswordPage />
									)
								}
							/>
							<Route
								path="/reset-password/:token"
								element={
									isAuthenticated ? (
										<Navigate to="/home" />
									) : (
										<ResetPasswordPage />
									)
								}
							/>
						</Route>

						{/* Protected */}
						<Route element={<ProtectedRoute />}>
							<Route element={<AppLayout />}>
								<Route path="/home" element={<HomePage />} />
								<Route path="/profile" element={<UserProfilePage />} />
								<Route path="/settings" element={<UserSettingsPage />} />
								<Route path="/friends" element={<FriendsPage />} />
							</Route>
						</Route>

						{/* Root redirect */}
						<Route
							path="/"
							element={
								<Navigate to={isAuthenticated ? "/home" : "/login"} replace />
							}
						/>

						{/* Not Found route */}
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</ProfileProvider>
			</ToastProvider>
		</Router>
	);
}

export default App;
