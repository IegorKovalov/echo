import React, { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";

const CountdownTimer = ({ expiresAt }) => {
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

	return (
		<div className="countdown-container">
			<div className="countdown-text">
				<FaClock className="me-2 text-secondary" />
				{isExpired ? (
					<span className="text-danger">Expired</span>
				) : (
					<>
						<strong>
							{remainingTime.hours > 0
								? `${formatTime(remainingTime.hours)}h`
								: `${formatTime(remainingTime.minutes)}m`}
						</strong>
					</>
				)}
			</div>
		</div>
	);
};

export default CountdownTimer;
