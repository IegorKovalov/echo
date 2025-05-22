import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProviders } from "./context/AppProviders";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import RoomsPage from "./pages/RoomsPage";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";
import SignupPage from "./pages/SignupPage";
import SuccessPage from "./pages/SuccessPage";

function App() {
	return (
		<Router>
			<AppProviders>
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
					<Route
						path="/rooms"
						element={
							<ProtectedRoute>
								<Layout>
									<RoomsPage />
								</Layout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/room/:roomId"
						element={
							<ProtectedRoute>
								<Layout showHeader={false}>
									{" "}
									{/* RoomDetailPage has its own header */}
									<RoomDetailPage />
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
						path="/verify-email/:userId"
						element={
							<Layout showHeader={false}>
								<OTPVerificationPage />
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
			</AppProviders>
		</Router>
	);
}

export default App;
