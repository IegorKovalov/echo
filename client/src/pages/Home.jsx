import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";
import MainLayout from "../layouts/MainLayout";

function Home() {
	const { user } = useContext(AuthContext);

	return (
		<MainLayout>
			<div>
				<p>Home Page - Need to implement the whole project logic.</p>
			</div>
		</MainLayout>
	);
}

export default Home;
