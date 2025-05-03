import React, { useEffect, useState } from "react";
import { FaClock, FaRedo } from "react-icons/fa";

const CountdownTimer = ({
	expiresAt,
	expirationProgress = 0,
	renewalCount = 0,
	onRenew = null,
	canRenew = false,
}) => {
	const [remainingTime, setRemainingTime] = useState({
		hours: 0,
		minutes: 0,
		seconds: 0,
		totalMs: 0,
	});
	const [isExpired, setIsExpired] = useState(false);

	useEffect(() => {
		const calculateTimeLeft = () => {
			const now = new Date();
			const expirationDate = new Date(expiresAt);
			const totalMs = Math.max(0, expirationDate - now);

			if (totalMs <= 0) {
				setIsExpired(true);
				return {
					hours: 0,
					minutes: 0,
					seconds: 0,
					totalMs: 0,
				};
			}

			const hours = Math.floor(totalMs / (1000 * 60 * 60));
			const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

			return {
				hours,
				minutes,
				seconds,
				totalMs,
			};
		};

		setRemainingTime(calculateTimeLeft());

		const timer = setInterval(() => {
			const timeLeft = calculateTimeLeft();
			setRemainingTime(timeLeft);
		}, 1000);

		return () => clearInterval(timer);
	}, [expiresAt]);

	const formatTime = (time) => (time < 10 ? `0${time}` : time);

	// Determine progress bar color based on expiration progress
	const getProgressColor = () => {
		if (expirationProgress < 50) return "bg-success";
		if (expirationProgress < 75) return "bg-warning";
		return "bg-danger";
	};

	// Format time for display
	const getTimeDisplay = () => {
		if (isExpired) return "Expired";

		if (remainingTime.hours > 0) {
			return `${formatTime(remainingTime.hours)}h ${formatTime(
				remainingTime.minutes
			)}m`;
		}

		if (remainingTime.minutes > 0) {
			return `${formatTime(remainingTime.minutes)}m ${formatTime(
				remainingTime.seconds
			)}s`;
		}

		return `${formatTime(remainingTime.seconds)}s`;
	};

	return (
		<div className="countdown-container d-flex align-items-center">
			{canRenew && (
				<button
					onClick={onRenew}
					className="renew-button me-2 bg-transparent border-0 p-0 text-primary"
					title={`Renew (${renewalCount}/3 used)`}
				>
					<FaRedo size={14} />
				</button>
			)}

			<div className="d-flex flex-column countdown-wrapper">
				<div className="countdown-text d-flex align-items-center mb-1">
					<FaClock className="me-2 text-secondary" size={14} />
					<span
						className={
							isExpired ? "text-danger fw-medium" : "text-secondary fw-medium"
						}
						style={{ fontSize: "0.85rem" }}
					>
						{getTimeDisplay()}
					</span>
				</div>

				{!isExpired && expirationProgress > 0 && (
					<div className="progress rounded-pill" style={{ height: "4px" }}>
						<div
							className={`progress-bar ${getProgressColor()}`}
							role="progressbar"
							style={{ width: `${expirationProgress}%` }}
							aria-valuenow={expirationProgress}
							aria-valuemin="0"
							aria-valuemax="100"
						></div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CountdownTimer;
