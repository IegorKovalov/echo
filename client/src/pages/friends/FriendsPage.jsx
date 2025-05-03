import { useState } from "react";
import { Card, Col, Container, Nav, Row, Tab } from "react-bootstrap"; // Import Nav
import { FaUserClock, FaUserFriends, FaUserPlus } from "react-icons/fa";
import UserAvatar from "../../components/common/UserAvatar"; // Import UserAvatar
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
				<Row className="g-4">
					{" "}
					{/* Added gap */}
					<Col lg={3} md={4}>
						<Card className="shadow-sm border-0 rounded-4 overflow-hidden">
							<Card.Body className="p-0">
								<div className="p-4 text-center border-bottom">
									<div className="mb-3">
										{/* User Avatar */}
										<UserAvatar
											fullName={currentUser?.fullName}
											src={currentUser?.profilePicture}
											variant="settings" // Use settings variant for larger size
										/>
									</div>
									<h5 className="mb-1 fw-bold">{currentUser?.fullName}</h5>
									<p className="text-secondary mb-0">
										@{currentUser?.username}
									</p>
								</div>

								{/* Friends Navigation Tabs */}
								<Nav variant="pills" className="flex-column friends-nav p-2">
									<Nav.Item>
										<Nav.Link
											eventKey="friends"
											className="d-flex align-items-center p-3 rounded-3 mb-1 cursor-pointer"
										>
											<FaUserFriends className="me-3" />
											Friends
										</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link
											eventKey="requests"
											className="d-flex align-items-center p-3 rounded-3 mb-1 cursor-pointer"
										>
											<FaUserClock className="me-3" />
											Friend Requests
										</Nav.Link>
									</Nav.Item>
									<Nav.Item>
										<Nav.Link
											eventKey="suggestions"
											className="d-flex align-items-center p-3 rounded-3 cursor-pointer"
										>
											<FaUserPlus className="me-3" />
											Suggestions
										</Nav.Link>
									</Nav.Item>
								</Nav>
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
