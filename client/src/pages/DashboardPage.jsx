// client/src/pages/DashboardPage.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function DashboardPage() {
	const { user, logout } = useContext(AuthContext);

	const handleLogout = () => {
		logout();
	};

	return (
		<div className="container py-5">
			<div className="row justify-content-center">
				<div className="col-lg-8">
					<div className="card shadow">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center mb-4">
								<h1 className="card-title mb-0">Dashboard</h1>
								<button
									onClick={handleLogout}
									className="btn btn-outline-danger"
								>
									Logout
								</button>
							</div>

							<div className="alert alert-success mb-4">
								<strong>Welcome, {user?.fullName || user?.username}!</strong>{" "}
								You've successfully logged in.
							</div>

							<div className="card mb-4">
								<div className="card-body">
									<h3 className="card-title">Your Profile</h3>
									<div className="row align-items-center">
										<div className="col-md-3 text-center mb-3 mb-md-0">
											{user?.profilePicture ? (
												<img
													src={user.profilePicture}
													alt="Profile"
													className="rounded-circle img-fluid"
													style={{ maxWidth: "120px" }}
												/>
											) : (
												<div
													className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
													style={{
														width: "120px",
														height: "120px",
														margin: "0 auto",
													}}
												>
													<span style={{ fontSize: "48px" }}>
														{user?.username?.charAt(0)?.toUpperCase()}
													</span>
												</div>
											)}
										</div>
										<div className="col-md-9">
											<div className="mb-2">
												<strong>Username:</strong> {user?.username}
											</div>
											<div className="mb-2">
												<strong>Full Name:</strong> {user?.fullName}
											</div>
											<div>
												<strong>Email:</strong> {user?.email}
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="text-center">
								<Link to="/" className="btn btn-primary">
									Go to Home Page
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default DashboardPage;
