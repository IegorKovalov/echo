import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SignUpPage from "./pages/SignUpPage";
import ProtectedRoutes from "./utils/ProtectedRoutes";

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<Routes>
					{/* Public routes */}
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignUpPage />} />
					<Route path="/forgotPassword" element={<ForgotPasswordPage />} />
					<Route path="/resetPassword/:token" element={<ResetPasswordPage />} />

					{/* Protected routes */}
					<Route element={<ProtectedRoutes />}>
						<Route path="/home" element={<Home />} />
						<Route path="/" element={<Home />} />
						<Route path="/profile" element={<ProfilePage />} />
					</Route>
				</Routes>
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
