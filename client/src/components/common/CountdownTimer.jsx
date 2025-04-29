import React, { useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";
import { FaHourglass, FaRedoAlt } from "react-icons/fa";

const CountdownTimer = ({
	expiresAt,
	expirationProgress = 0,
	renewalCount = 0,
	onRenew,
	canRenew = true,
}) => {
	const [remainingTime, setRemainingTime] = useState({
		hours: 0,
		minutes: 0,
		seconds: 0,
		totalMs: 0,
	});
	const [progress, setProgress] = useState(expirationProgress);
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

			const expirationDate = new Date(expiresAt);
			const totalDuration =
				expirationDate -
				new Date(new Date(expiresAt).getTime() - 24 * 60 * 60 * 1000);
			const elapsed = totalDuration - timeLeft.totalMs;
			const newProgress = Math.min(
				100,
				Math.max(0, (elapsed / totalDuration) * 100)
			);
			setProgress(newProgress);
		}, 1000);

		return () => clearInterval(timer);
	}, [expiresAt]);

	const formatTime = (time) => {
		return time < 10 ? `0${time}` : time;
	};
	const getProgressVariant = () => {
		if (progress > 85) return "danger";
		if (progress > 50) return "warning";
		return "info";
	};

	const getFadingStyle = () => {
		const fadeIntensity = progress / 100;
		return {
			opacity: 1 - fadeIntensity * 0.5,
			transition: "opacity 0.5s ease-in-out",
		};
	};
	const handleRenew = () => {
		if (onRenew && canRenew) {
			onRenew();
		}
	};

	const canBeRenewed = canRenew && renewalCount < 3 && !isExpired;

	return (
		<div className="countdown-container mb-2" style={getFadingStyle()}>
			<div className="d-flex justify-content-between align-items-center mb-1">
				<div className="d-flex align-items-center">
					<FaHourglass className="me-2 text-secondary" />
					<span className="countdown-text">
						{isExpired ? (
							<span className="text-danger">Expired</span>
						) : (
							<>
								Expires in:{" "}
								<strong>
									{remainingTime.hours > 0 &&
										`${formatTime(remainingTime.hours)}h `}
									{formatTime(remainingTime.minutes)}m{" "}
									{formatTime(remainingTime.seconds)}s
								</strong>
							</>
						)}
					</span>
				</div>

				{/* Renewal button */}
				{canBeRenewed && (
					<button
						className="btn btn-sm renewal-button"
						onClick={handleRenew}
						title={`Renew post (${renewalCount}/3 renewals used)`}
					>
						<FaRedoAlt className="me-1" />
						Renew
					</button>
				)}

				{/* Show renewal count if any renewals have been used */}
				{renewalCount > 0 && (
					<span className="badge bg-secondary renewals-badge ms-2">
						{renewalCount}/3 renewals
					</span>
				)}
			</div>

			<ProgressBar
				now={progress}
				variant={getProgressVariant()}
				className="expiration-progress"
				style={{ height: "5px" }}
			/>
		</div>
	);
};

export default CountdownTimer;
