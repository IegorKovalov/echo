import React from "react";
import Navbar from "../components/Navbar";

const MainLayout = ({ children }) => {
	return (
		<div className="min-vh-100 d-flex flex-column">
			<Navbar />
			<div className="container py-4 flex-grow-1">{children}</div>
			<footer className="py-3 bg-light mt-auto"></footer>
		</div>
	);
};

export default MainLayout;
