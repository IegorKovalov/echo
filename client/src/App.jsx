import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ViewTrackingProvider } from "./context/ViewTrackingContext";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";
import SignupPage from "./pages/SignupPage";
import SuccessPage from "./pages/SuccessPage";

function App() {
	return (
		<Router>
			<AuthProvider>
				<ToastProvider>
					<ViewTrackingProvider>
						<Routes>
							{/* Protected routes */}
							<Route
								path="/"
								element={
									<ProtectedRoute>
										<Layout>
											<HomePage />
										</Layout>
									</ProtectedRoute>
								}
							/>
							<Route
								path="/profile"
								element={
									<ProtectedRoute>
										<Layout>
											<ProfilePage />
										</Layout>
									</ProtectedRoute>
								}
							/>
							<Route
								path="/profile/:userId"
								element={
									<ProtectedRoute>
										<Layout>
											<ProfilePage />
										</Layout>
									</ProtectedRoute>
								}
							/>
							<Route
								path="/settings"
								element={
									<ProtectedRoute>
										<Layout>
											<SettingsPage />
										</Layout>
									</ProtectedRoute>
								}
							/>
							<Route
								path="/search"
								element={
									<ProtectedRoute>
										<Layout>
											<SearchPage />
										</Layout>
									</ProtectedRoute>
								}
							/>

							{/* Public routes */}
							<Route
								path="/login"
								element={
									<Layout showHeader={false}>
										<LoginPage />
									</Layout>
								}
							/>
							<Route
								path="/signup"
								element={
									<Layout showHeader={false}>
										<SignupPage />
									</Layout>
								}
							/>
							<Route
								path="/forgot-password"
								element={
									<Layout showHeader={false}>
										<ForgotPasswordPage />
									</Layout>
								}
							/>
							<Route
								path="/reset-password/:token"
								element={
									<Layout showHeader={false}>
										<ResetPasswordPage />
									</Layout>
								}
							/>
							<Route
								path="/success"
								element={
									<Layout showHeader={false}>
										<SuccessPage />
									</Layout>
								}
							/>

							{/* 404 - Not Found Page (catch all) */}
							<Route
								path="*"
								element={
									<Layout showHeader={false}>
										<NotFoundPage />
									</Layout>
								}
							/>
						</Routes>
					</ViewTrackingProvider>
				</ToastProvider>
			</AuthProvider>
		</Router>
	);
}

export default App;
