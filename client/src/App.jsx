import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import { AuthProvider } from "./context/AuthContext";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SettingsPage from "./pages/SettingsPage";
import SignupPage from "./pages/SignupPage";
import SuccessPage from "./pages/SuccessPage";

function App() {
	return (
		<Router>
			<AuthProvider>
				<Routes>
					{/* Protected routes */}
					<Route
						path="/"
						element={
							<Layout requireAuth={true}>
								<HomePage />
							</Layout>
						}
					/>
					<Route
						path="/profile"
						element={
							<Layout requireAuth={true}>
								<ProfilePage />
							</Layout>
						}
					/>
					<Route
						path="/settings"
						element={
							<Layout requireAuth={true}>
								<SettingsPage />
							</Layout>
						}
					/>

					{/* Public routes */}
					<Route
						path="/login"
						element={
							<Layout requireAuth={false} showHeader={false}>
								<LoginPage />
							</Layout>
						}
					/>
					<Route
						path="/signup"
						element={
							<Layout requireAuth={false} showHeader={false}>
								<SignupPage />
							</Layout>
						}
					/>
					<Route
						path="/forgot-password"
						element={
							<Layout requireAuth={false} showHeader={false}>
								<ForgotPasswordPage />
							</Layout>
						}
					/>
					<Route
						path="/reset-password/:token"
						element={
							<Layout requireAuth={false} showHeader={false}>
								<ResetPasswordPage />
							</Layout>
						}
					/>
					<Route
						path="/success"
						element={
							<Layout requireAuth={false} showHeader={false}>
								<SuccessPage />
							</Layout>
						}
					/>
				</Routes>
			</AuthProvider>
		</Router>
	);
}

export default App;
