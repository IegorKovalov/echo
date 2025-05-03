import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { FaBell, FaComment, FaHeart, FaPlus } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const HomePage = () => {
	const { currentUser } = useAuth();
	const [greeting, setGreeting] = useState("");

	useEffect(() => {
		const hour = new Date().getHours();
		let newGreeting = "";

		if (hour < 12) {
			newGreeting = "Good morning";
		} else if (hour < 18) {
			newGreeting = "Good afternoon";
		} else {
			newGreeting = "Good evening";
		}

		setGreeting(newGreeting);
	}, []);

	return (
		<Container className="py-4">
			<div className="mb-4">
				<h1 className="fw-bold text-primary mb-3">
					{greeting}, {currentUser?.fullName?.split(" ")[0] || "User"}!
				</h1>
				<p className="text-secondary">
					Welcome to your personalized home feed. Here's what's happening.
				</p>
			</div>

			<Row className="g-4">
				<Col lg={8}>
					<Card className="shadow-sm border-0 rounded-4 overflow-hidden mb-4">
						<Card.Body className="p-4">
							<div className="create-post-placeholder p-4 bg-light rounded-4 text-center mb-4">
								<div className="mb-3">
									<div
										className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3"
										style={{ width: "70px", height: "70px" }}
									>
										<FaPlus size={24} className="text-primary" />
									</div>
								</div>
								<h4 className="fw-bold text-primary mb-2">
									Create Your First Echo
								</h4>
								<p className="text-secondary">
									Share your thoughts, moments, and experiences with your
									friends.
								</p>
							</div>

							<div className="feed-placeholder">
								<div className="text-center py-5 my-4">
									<div
										className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
										style={{ width: "80px", height: "80px" }}
									>
										<FaPlus size={36} className="text-primary" />
									</div>
									<h3 className="fw-bold text-primary mb-3">Coming Soon</h3>
									<p className="text-secondary">
										Your personalized feed will appear here. Stay tuned!
									</p>
								</div>
							</div>
						</Card.Body>
					</Card>
				</Col>

				<Col lg={4}>
					<Card className="shadow-sm border-0 rounded-4 overflow-hidden">
						<Card.Body className="p-4">
							<h5 className="fw-bold mb-4">Activity Overview</h5>
							<div className="activity-stats">
								<div className="activity-stat-item d-flex align-items-center p-3 bg-light rounded-4 mb-3">
									<div
										className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 me-3"
										style={{ width: "50px", height: "50px" }}
									>
										<FaHeart className="text-primary" />
									</div>
									<div>
										<h3 className="fw-bold mb-0">0</h3>
										<p className="text-secondary mb-0">Likes Received</p>
									</div>
								</div>
								<div className="activity-stat-item d-flex align-items-center p-3 bg-light rounded-4 mb-3">
									<div
										className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 me-3"
										style={{ width: "50px", height: "50px" }}
									>
										<FaComment className="text-primary" />
									</div>
									<div>
										<h3 className="fw-bold mb-0">0</h3>
										<p className="text-secondary mb-0">Comments</p>
									</div>
								</div>
								<div className="activity-stat-item d-flex align-items-center p-3 bg-light rounded-4">
									<div
										className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3 me-3"
										style={{ width: "50px", height: "50px" }}
									>
										<FaBell className="text-primary" />
									</div>
									<div>
										<h3 className="fw-bold mb-0">0</h3>
										<p className="text-secondary mb-0">Notifications</p>
									</div>
								</div>
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default HomePage;
