import { useState } from "react";
import { Col } from "react-bootstrap";
import { FaComment, FaPlus } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Messenger = () => {
	const { currentUser } = useAuth();
	const [unreadMessages, setUnreadMessages] = useState(3);

	return (
		<Col lg={3} className="messenger-sidebar d-none d-lg-block">
			<div className="messenger-content bg-white rounded-3 shadow-sm h-100 d-flex flex-column">
				<div className="messenger-header p-3 border-bottom">
					<div className="d-flex justify-content-between align-items-center">
						<h5 className="fw-bold m-0">Messages</h5>
						<button className="new-message-btn bg-white border-0 rounded-circle p-2">
							<FaPlus className="text-primary" />
						</button>
					</div>
				</div>

				<div className="messenger-scrollable flex-grow-1 p-3">
					<div className="messenger-placeholder p-4 text-center bg-light rounded-3">
						<div
							className="messenger-icon-container mx-auto mb-3 bg-primary bg-opacity-10 rounded-circle p-3 d-flex align-items-center justify-content-center"
							style={{ width: "60px", height: "60px" }}
						>
							<FaComment className="text-primary fs-4" />
						</div>
						<h5 className="fw-bold mb-2">Coming Soon</h5>
						<p className="text-secondary mb-0">
							Our messenger feature will be available soon!
						</p>
					</div>
				</div>

				{unreadMessages > 0 && (
					<div className="messenger-footer p-3 border-top">
						<div className="unread-badge bg-primary bg-opacity-10 text-primary rounded-pill py-2 px-3 text-center fw-medium">
							{unreadMessages} unread messages
						</div>
					</div>
				)}
			</div>
		</Col>
	);
};

export default Messenger;
