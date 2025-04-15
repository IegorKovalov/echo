import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ForgotPassword from "./components/Auth/ForgotPassword";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ResetPassword from "./components/Auth/ResetPassword";
import Navbar from "./components/Layout/Navbar";
import ProtectedRoute from "./components/Layout/ProtectedRoute";
import UserProfile from "./components/Profile/myProfile/UserProfile";
import UserSettings from "./components/Profile/settings/UserSettings";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
	return (
		<Router>
			<AuthProvider>
				<div className="app-container">
					<Navbar />
					<main className="main-content">
						<Routes>
							{/* Public routes */}
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
							<Route path="/forgot-password" element={<ForgotPassword />} />
							<Route
								path="/reset-password/:token"
								element={<ResetPassword />}
							/>

							{/* Protected routes */}
							<Route element={<ProtectedRoute />}>
								<Route path="/profile" element={<UserProfile />} />
								<Route path="/settings" element={<UserSettings />} />
							</Route>

							{/* Redirect to login if path doesn't match */}
							<Route path="/" element={<Navigate to="/login" replace />} />
							<Route path="*" element={<Navigate to="/login" replace />} />
						</Routes>
					</main>
				</div>
				<ToastContainer position="bottom-right" />
			</AuthProvider>
		</Router>
	);
}

export default App;
