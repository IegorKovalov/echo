import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

const HomePage = () => {
	const { currentUser } = useAuth();
	const [greeting, setGreeting] = useState("");

	// Set appropriate greeting based on time of day
	useEffect(() => {
		const hour = new Date().getHours();
		let newGreeting = "";

		if (hour < 12) {
			newGreeting = "Good morning";
		} else if (hour < 18) {
			newGreeting = "Good afternoon";
		} else {
			newGreeting = "Good evening";
		}

		setGreeting(newGreeting);
	}, []);

	return (
		<Container className="py-5">
			<div className="text-white">
				<h1 className="mb-4">
					{greeting}, {currentUser?.fullName?.split(" ")[0] || "User"}!
				</h1>
				<p className="text-secondary mb-5">
					Welcome to your personalized home feed.
				</p>

				{/* Content will be added here */}
				<div className="text-center py-5 my-5">
					<h3 className="gradient-text mb-3">Coming Soon</h3>
					<p className="text-secondary">
						We're working on your personalized home feed. Check back soon!
					</p>
				</div>
			</div>
		</Container>
	);
};

export default HomePage;
