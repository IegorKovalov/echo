import { Outlet } from "react-router-dom";

const AuthLayout = () => {
	return (
		<div className="min-h-screen bg-black text-white d-flex flex-column">
			<div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
				<Outlet />
			</div>
		</div>
	);
};

export default AuthLayout;
