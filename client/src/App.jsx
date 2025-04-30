import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/layout/Navbar";
import Messenger from "./components/layout/Messenger";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { ToastProvider } from "./context/ToastContext";
import { AppRoutes } from "./routes";

import "./styles";
import "./styles/layout.css";

function AppLayout() {
	const { currentUser, isAuthenticated } = useAuth();

	return (
		<div className="app-layout">
			{currentUser && <Navbar />}
			{currentUser ? (
				<div className="app-body">
					<Messenger />
					<main className="main-content">
						<AppRoutes isAuthenticated={isAuthenticated()} />
					</main>
				</div>
			) : (
				<main className="main-content">
					<AppRoutes isAuthenticated={isAuthenticated()} />
				</main>
			)}
		</div>
	);
}

function App() {
	return (
		<Router>
			<ToastProvider>
				<AuthProvider>
					<ProfileProvider>
						<AppLayout />
					</ProfileProvider>
				</AuthProvider>
			</ToastProvider>
		</Router>
	);
}

export default App;
