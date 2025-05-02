import { Outlet } from "react-router-dom";

const AuthLayout = () => {
	return (
		<div className="min-h-screen bg-black text-white d-flex flex-column">
			<div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-4">
				<Outlet />
			</div>
			<footer className="py-3 text-center text-secondary">
				© 2025 Echo. All rights reserved.
			</footer>
		</div>
	);
};

export default AuthLayout;
