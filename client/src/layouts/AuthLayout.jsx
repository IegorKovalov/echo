import React from "react";
import { Link } from "react-router-dom";

const AuthLayout = ({ children, title }) => {
	return (
		<div className="min-vh-100 bg-light d-flex flex-column justify-content-center py-4">
			<div className="container">
				<div className="row justify-content-center">
					<div className="col-12 col-md-8 col-lg-6">
						<h2 className="text-center fw-bold mb-4">{title}</h2>

						<div className="bg-white p-4 p-md-5 rounded shadow">{children}</div>

						<div className="mt-4 text-center">
							<Link to="/" className="fw-medium text-primary">
								Return to Home
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AuthLayout;
