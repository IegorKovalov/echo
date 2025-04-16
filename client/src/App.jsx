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
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProfileProvider } from "./contexts/ProfileContext";

function AppLayout() {
	const { currentUser } = useAuth();

	return (
		<div className="app-container">
			{currentUser && <Navbar />}
			<main className="main-content">
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/forgot-password" element={<ForgotPassword />} />
					<Route path="/reset-password/:token" element={<ResetPassword />} />
					<Route element={<ProtectedRoute />}>
						<Route path="/profile" element={<UserProfile />} />
						<Route path="/settings" element={<UserSettings />} />
					</Route>
					<Route path="/" element={<Navigate to="/login" replace />} />
					<Route path="*" element={<Navigate to="/login" replace />} />
				</Routes>
			</main>
		</div>
	);
}

function App() {
	return (
		<Router>
			<AuthProvider>
				<ProfileProvider>
					<AppLayout />
					<ToastContainer position="bottom-right" />
				</ProfileProvider>
			</AuthProvider>
		</Router>
	);
}

export default App;
