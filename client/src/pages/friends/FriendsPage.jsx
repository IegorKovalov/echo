import { useState } from "react";
import { Card, Col, Container, Row, Tab } from "react-bootstrap";
import { FaUserClock, FaUserFriends, FaUserPlus } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const FriendsPage = () => {
	const { currentUser } = useAuth();
	const [activeTab, setActiveTab] = useState("friends");

	return (
		<Container className="py-4">
			<div className="mb-4">
				<h1 className="fw-bold text-primary mb-3">Friends</h1>
				<p className="text-secondary">
					Connect with your friends and manage your connections.
				</p>
			</div>

			<Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
				<Row>
					<Col lg={3} md={4} className="mb-4">
						<Card className="shadow-sm border-0 rounded-4 overflow-hidden">
							<Card.Body className="p-0">
								<div className="p-4 text-center border-bottom">
									<div className="mb-3">
										<div
											className="avatar-placeholder d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle p-3"
											style={{ width: "80px", height: "80px" }}
										>
											<FaUserFriends size={36} className="text-primary" />
										</div>
									</div>
									<h5 className="mb-1 fw-bold">{currentUser?.fullName}</h5>
									<p className="text-secondary mb-0">
										@{currentUser?.username}
									</p>
								</div>

								<div className="friends-nav p-2">
									<div
										className={`friends-nav-item d-flex align-items-center p-3 rounded-3 mb-1 cursor-pointer ${
											activeTab === "friends" ? "bg-primary text-white" : ""
										}`}
										onClick={() => setActiveTab("friends")}
									>
										<FaUserFriends className="me-3" />
										Friends
									</div>
									<div
										className={`friends-nav-item d-flex align-items-center p-3 rounded-3 mb-1 cursor-pointer ${
											activeTab === "requests" ? "bg-primary text-white" : ""
										}`}
										onClick={() => setActiveTab("requests")}
									>
										<FaUserClock className="me-3" />
										Friend Requests
									</div>
									<div
										className={`friends-nav-item d-flex align-items-center p-3 rounded-3 cursor-pointer ${
											activeTab === "suggestions" ? "bg-primary text-white" : ""
										}`}
										onClick={() => setActiveTab("suggestions")}
									>
										<FaUserPlus className="me-3" />
										Suggestions
									</div>
								</div>
							</Card.Body>
						</Card>
					</Col>

					<Col lg={9} md={8}>
						<Tab.Content>
							<Tab.Pane eventKey="friends">
								<Card className="shadow-sm border-0 rounded-4">
									<Card.Body className="p-4">
										<div className="text-center py-5 my-4">
											<div
												className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
												style={{ width: "80px", height: "80px" }}
											>
												<FaUserFriends size={36} className="text-primary" />
											</div>
											<h3 className="fw-bold text-primary mb-3">Coming Soon</h3>
											<p className="text-secondary">
												Your friends list will appear here. Stay tuned!
											</p>
										</div>
									</Card.Body>
								</Card>
							</Tab.Pane>
							<Tab.Pane eventKey="requests">
								<Card className="shadow-sm border-0 rounded-4">
									<Card.Body className="p-4">
										<div className="text-center py-5 my-4">
											<div
												className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
												style={{ width: "80px", height: "80px" }}
											>
												<FaUserClock size={36} className="text-primary" />
											</div>
											<h3 className="fw-bold text-primary mb-3">Coming Soon</h3>
											<p className="text-secondary">
												Friend requests will be managed here. Stay tuned!
											</p>
										</div>
									</Card.Body>
								</Card>
							</Tab.Pane>
							<Tab.Pane eventKey="suggestions">
								<Card className="shadow-sm border-0 rounded-4">
									<Card.Body className="p-4">
										<div className="text-center py-5 my-4">
											<div
												className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3"
												style={{ width: "80px", height: "80px" }}
											>
												<FaUserPlus size={36} className="text-primary" />
											</div>
											<h3 className="fw-bold text-primary mb-3">Coming Soon</h3>
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
