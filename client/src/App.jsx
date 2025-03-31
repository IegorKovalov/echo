import { useState } from "react";
import "./App.css";

function App() {
	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-md">
				<h1 className="text-3xl font-bold text-gray-800 mb-4">
					Hello Tailwind CSS
				</h1>
				<p className="text-gray-600">
					Your Tailwind CSS setup is working correctly!
				</p>
				<button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
					Click me
				</button>
			</div>
		</div>
	);
}

export default App;
