import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Messenger from "../components/layout/Messenger";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";

const AppLayout = () => {
	const { currentUser } = useAuth();

	return (
		<>
			<div className="sticky-navbar">
				<Navbar /> {/* Full-width navbar */}
			</div>

			<div className="app-body" style={{ display: "flex" }}>
				{/* Scrollable Outlet content */}
				<div className="main-scrollable-content" style={{ flex: 1 }}>
					<Outlet />
				</div>

				{/* Messenger: only if user is logged in */}
				{currentUser && (
					<div className="messenger-sidebar">
						<Messenger />
					</div>
				)}
			</div>
		</>
	);
};

export default AppLayout;
