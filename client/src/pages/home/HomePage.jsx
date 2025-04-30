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
			<div className="text-white mb-4">
				<h1 className="gradient-text mb-4">
					{greeting}, {currentUser?.fullName?.split(" ")[0] || "User"}!
				</h1>
				<p className="text-secondary">
					Welcome to your personalized home feed. Here's what's happening.
				</p>
			</div>

			<Row className="g-4">
				<Col lg={8}>
					<Card className="home-feed border-0">
						<Card.Body>
							<div className="create-post-placeholder p-4 text-center mb-4">
								<div className="avatar-placeholder mb-3">
									<FaPlus size={24} className="gradient-text" />
								</div>
								<h4 className="gradient-text mb-2">Create Your First Echo</h4>
								<p className="text-secondary">
									Share your thoughts, moments, and experiences with your friends.
								</p>
							</div>

							<div className="feed-placeholder">
								<div className="text-center py-5 my-5">
									<div className="gradient-text mb-3">
										<FaPlus size={48} />
									</div>
									<h3 className="gradient-text mb-3">Coming Soon</h3>
									<p className="text-secondary">
										Your personalized feed will appear here. Stay tuned!
									</p>
								</div>
							</div>
						</Card.Body>
					</Card>
				</Col>

				<Col lg={4}>
					<Card className="home-sidebar border-0">
						<Card.Body>
							<h5 className="gradient-text mb-4">Activity Overview</h5>
							<div className="activity-stats">
								<div className="activity-stat-item mb-4">
									<FaHeart className="stat-icon gradient-text" />
									<div className="stat-content">
										<h3 className="stat-number">0</h3>
										<p className="stat-label">Likes Received</p>
									</div>
								</div>
								<div className="activity-stat-item mb-4">
									<FaComment className="stat-icon gradient-text" />
									<div className="stat-content">
										<h3 className="stat-number">0</h3>
										<p className="stat-label">Comments</p>
									</div>
								</div>
								<div className="activity-stat-item">
									<FaBell className="stat-icon gradient-text" />
									<div className="stat-content">
										<h3 className="stat-number">0</h3>
										<p className="stat-label">Notifications</p>
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
