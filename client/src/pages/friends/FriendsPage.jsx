import { useEffect, useState } from "react";
import { Card, Col, Container, Row, Tab } from "react-bootstrap";
import { FaUserFriends, FaUserPlus, FaUserClock } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const FriendsPage = () => {
	const { currentUser } = useAuth();
	const [activeTab, setActiveTab] = useState("friends");

	return (
		<Container className="py-4">
			<div className="text-white mb-4">
				<h1 className="gradient-text mb-4">Friends</h1>
				<p className="text-secondary">
					Connect with your friends and manage your connections.
				</p>
			</div>

			<Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
				<Row>
					<Col lg={3} md={4} className="mb-4">
						<Card className="friends-sidebar border-0">
							<Card.Body className="p-0">
								<div className="user-profile-summary p-3 text-center">
									<div className="mb-3">
										<div className="avatar-placeholder">
											<FaUserFriends size={48} className="gradient-text" />
										</div>
									</div>
									<h5 className="mb-1">{currentUser?.fullName}</h5>
									<p className="text-secondary mb-0">@{currentUser?.username}</p>
								</div>

								<div className="friends-nav p-3">
									<div
										className={`friends-nav-item ${
											activeTab === "friends" ? "active" : ""
										}`}
										onClick={() => setActiveTab("friends")}
									>
										<FaUserFriends className="me-2" />
										Friends
									</div>
									<div
										className={`friends-nav-item ${
											activeTab === "requests" ? "active" : ""
										}`}
										onClick={() => setActiveTab("requests")}
									>
										<FaUserClock className="me-2" />
										Friend Requests
									</div>
									<div
										className={`friends-nav-item ${
											activeTab === "suggestions" ? "active" : ""
										}`}
										onClick={() => setActiveTab("suggestions")}
									>
										<FaUserPlus className="me-2" />
										Suggestions
									</div>
								</div>
							</Card.Body>
						</Card>
					</Col>

					<Col lg={9} md={8}>
						<Tab.Content>
							<Tab.Pane eventKey="friends">
								<Card className="friends-content border-0">
									<Card.Body>
										<div className="text-center py-5 my-5">
											<div className="gradient-text mb-3">
												<FaUserFriends size={48} />
											</div>
											<h3 className="gradient-text mb-3">Coming Soon</h3>
											<p className="text-secondary">
												Your friends list will appear here. Stay tuned!
											</p>
										</div>
									</Card.Body>
								</Card>
							</Tab.Pane>
							<Tab.Pane eventKey="requests">
								<Card className="friends-content border-0">
									<Card.Body>
										<div className="text-center py-5 my-5">
											<div className="gradient-text mb-3">
												<FaUserClock size={48} />
											</div>
											<h3 className="gradient-text mb-3">Coming Soon</h3>
											<p className="text-secondary">
												Friend requests will be managed here. Stay tuned!
											</p>
										</div>
									</Card.Body>
								</Card>
							</Tab.Pane>
							<Tab.Pane eventKey="suggestions">
								<Card className="friends-content border-0">
									<Card.Body>
										<div className="text-center py-5 my-5">
											<div className="gradient-text mb-3">
												<FaUserPlus size={48} />
											</div>
											<h3 className="gradient-text mb-3">Coming Soon</h3>
											<p className="text-secondary">
												Friend suggestions will appear here. Stay tuned!
											</p>
										</div>
									</Card.Body>
								</Card>
							</Tab.Pane>
						</Tab.Content>
					</Col>
				</Row>
			</Tab.Container>
		</Container>
	);
};

export default FriendsPage;
