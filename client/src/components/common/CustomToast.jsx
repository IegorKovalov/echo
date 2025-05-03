import React, { useEffect, useRef, useState } from "react";
import Toast from "react-bootstrap/Toast";
import {
	FaBell,
	FaCheckCircle,
	FaExclamationTriangle,
	FaInfoCircle,
	FaTimesCircle,
} from "react-icons/fa";

function CustomToast({ message, onClose, toastType = "info" }) {
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

	// Configure toast based on toast type
	const getToastIcon = () => {
		switch (toastType) {
			case "success":
				return <FaCheckCircle className="text-success" />;
			case "error":
				return <FaTimesCircle className="text-danger" />;
			case "warning":
				return <FaExclamationTriangle className="text-warning" />;
			case "info":
			default:
				return <FaInfoCircle className="text-primary" />;
		}
	};

	const getToastClass = () => {
		switch (toastType) {
			case "success":
				return "echo-toast success-toast";
			case "error":
				return "echo-toast error-toast";
			case "warning":
				return "echo-toast warning-toast";
			case "info":
			default:
				return "echo-toast info-toast";
		}
	};

	return (
		<Toast
			onClose={handleClose}
			show={show}
			autohide={shouldAutohide}
			delay={5000}
			className={getToastClass()}
		>
			<Toast.Header className="echo-toast-header">
				<span className="toast-icon me-2">{getToastIcon()}</span>
				<strong className="me-auto">echo</strong>
				<small className="text-secondary">{timestamp}</small>
			</Toast.Header>
			<Toast.Body className="py-3">{message}</Toast.Body>
		</Toast>
	);
}

export default CustomToast;
