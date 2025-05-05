import React from "react";

export default function ProfileTabs({ activeTab, setActiveTab }) {
	return (
		<div className="mt-4 flex">
			<button
				onClick={() => setActiveTab("posts")}
				className={`mr-8 border-b-2 pb-2 font-medium ${
					activeTab === "posts"
						? "border-purple-600 text-purple-600"
						: "border-transparent text-gray-400 hover:text-white"
				}`}
			>
				Posts
			</button>
			<button
				onClick={() => setActiveTab("media")}
				className={`border-b-2 pb-2 font-medium ${
					activeTab === "media"
						? "border-purple-600 text-purple-600"
						: "border-transparent text-gray-400 hover:text-white"
				}`}
			>
				Media
			</button>
		</div>
	);
}
