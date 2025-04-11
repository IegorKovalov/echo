import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";

function Home() {
	const { user } = useContext(AuthContext);

	return (
		<div>
			<p>{user.fullName} logged in successfully</p>
		</div>
	);
}

export default Home;
