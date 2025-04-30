import { useState } from "react";
import { Card, Col } from "react-bootstrap";
import { FaComment, FaPlus } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Messenger = () => {
	const { currentUser } = useAuth();
	const [unreadMessages, setUnreadMessages] = useState(3);

	return (
		<Col lg={3} className="messenger-sidebar">
			<div className="messenger-content">
				<div className="messenger-header p-3">
					<div className="d-flex justify-content-between align-items-center">
						<h5 className="gradient-text mb-0">Messages</h5>
						<button className="new-message-btn">
							<FaPlus className="gradient-text" />
						</button>
					</div>
				</div>
				<div className="messenger-scrollable">
					<Card className="messenger-card border-0">
						<Card.Body className="p-0">
							<div className="messenger-placeholder p-4 text-center">
								<FaComment className="messenger-placeholder-icon mb-3" />
								<h5 className="gradient-text mb-2">Coming Soon</h5>
								<p className="text-secondary">
									Our messenger feature will be available soon!
								</p>
							</div>
						</Card.Body>
					</Card>
				</div>
				<div className="messenger-footer p-3">
					{unreadMessages > 0 && (
						<div className="unread-badge">{unreadMessages} unread messages</div>
					)}
				</div>
			</div>
		</Col>
	);
};

export default Messenger;
