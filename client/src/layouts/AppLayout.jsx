import { Outlet } from "react-router-dom";
import Messenger from "../components/layout/Messenger";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";

const AppLayout = () => {
	const { currentUser } = useAuth();

	return (
		<div className="app-layout">
			{currentUser && <Navbar />}
			<div className="app-body">
				<Messenger />
				<main className="main-content">
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default AppLayout;
