import React, { useEffect, useRef, useState } from "react";
import Toast from "react-bootstrap/Toast";
import { FaBell } from "react-icons/fa";

function CustomToast({ message, onClose, toastType }) {
	const [show, setShow] = useState(true);
	const [timestamp, setTimestamp] = useState("just now");
	const createdAtRef = useRef(Date.now());

	useEffect(() => {
		const interval = setInterval(() => {
			const secondsAgo = Math.floor((Date.now() - createdAtRef.current) / 1000);
			if (secondsAgo < 1) {
				setTimestamp("just now");
			} else if (secondsAgo === 1) {
				setTimestamp("1 sec ago");
			} else if (secondsAgo < 60) {
				setTimestamp(`${secondsAgo} sec ago`);
			} else if (secondsAgo < 3600) {
				const mins = Math.floor(secondsAgo / 60);
				setTimestamp(`${mins} min${mins > 1 ? "s" : ""} ago`);
			} else {
				const hours = Math.floor(secondsAgo / 3600);
				setTimestamp(`${hours} hour${hours > 1 ? "s" : ""} ago`);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const handleClose = () => {
		setShow(false);
		if (onClose) onClose();
	};

	const shouldAutohide = toastType === "error" || toastType === "success";

	return (
		<Toast
			onClose={handleClose}
			show={show}
			autohide={shouldAutohide}
			delay={3000}
			className="echo-toast"
		>
			<Toast.Header className="echo-toast-header">
				<span className="toast-icon">
					<FaBell />
				</span>
				<strong className="me-auto gradient-text">echo</strong>
				<small className="gradient-text">{timestamp}</small>
			</Toast.Header>
			<Toast.Body>{message}</Toast.Body>
		</Toast>
	);
}

export default CustomToast;
