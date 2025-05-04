import { Search, Sparkles, User, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Card from "./Card";

export default function SearchModal({ isOpen, onClose }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [searching, setSearching] = useState(false);
	const modalRef = useRef(null);
	const inputRef = useRef(null);

	// Focus the search input when the modal opens
	useEffect(() => {
		if (isOpen && inputRef.current) {
			setTimeout(() => {
				inputRef.current.focus();
			}, 100);
		}
	}, [isOpen]);

	// Close the modal when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				onClose();
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Close on escape key
	useEffect(() => {
		const handleEsc = (event) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEsc);
		}
		return () => {
			document.removeEventListener("keydown", handleEsc);
		};
	}, [isOpen, onClose]);

	// Prevent scrolling when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	// This is a placeholder function that will be replaced with actual search logic later
	const handleSearch = (e) => {
		e.preventDefault();
		if (!searchQuery.trim()) return;

		setSearching(true);

		// Simulate search delay
		setTimeout(() => {
			// Just a placeholder result
			setSearchResults([]);
			setSearching(false);
		}, 1000);
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 bg-gray-950/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
			<div
				ref={modalRef}
				className="bg-gray-900/90 border border-purple-500/20 rounded-3xl shadow-2xl w-full max-w-2xl mt-16 transform transition-all duration-300 ease-out shadow-purple-500/10"
				style={{
					boxShadow: "0 10px 25px -5px rgba(168, 85, 247, 0.2)",
					backdropFilter: "blur(12px)",
				}}
			>
				<div className="p-6">
					{/* Header */}
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-semibold text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
							Search Echo
						</h2>
						<button
							onClick={onClose}
							className="p-2 rounded-full hover:bg-gray-800/50 text-gray-400 hover:text-purple-400 transition-colors duration-200"
						>
							<X className="h-5 w-5" />
						</button>
					</div>

					{/* Search Form */}
					<form onSubmit={handleSearch} className="flex gap-2 mb-5">
						<div className="relative flex-1">
							<input
								ref={inputRef}
								type="text"
								placeholder="Search for users, posts, or topics..."
								className="w-full rounded-full border border-purple-500/30 bg-gray-800/70 pl-12 pr-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<div className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400">
								<Search className="h-5 w-5" />
							</div>
						</div>
						<button
							type="submit"
							className="rounded-full bg-gradient-to-r from-purple-600 to-blue-500 px-6 py-2 font-medium text-white hover:from-purple-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-purple-500/20"
							disabled={searching || !searchQuery.trim()}
						>
							{searching ? "Searching..." : "Search"}
						</button>
					</form>

					<p className="text-sm text-gray-400 mb-5 italic">
						This is a placeholder. Search functionality will be implemented
						later.
					</p>

					{/* Search Results */}
					<div className="max-h-96 overflow-y-auto px-2">
						{searching ? (
							<div className="text-center py-10">
								<div className="flex justify-center">
									<div className="relative">
										<div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping"></div>
										<Sparkles className="relative h-8 w-8 text-purple-500" />
									</div>
								</div>
								<p className="mt-4 text-gray-400">Searching...</p>
							</div>
						) : searchQuery && searchResults.length === 0 ? (
							<div className="bg-gray-800/50 rounded-2xl p-6 text-center border border-gray-700/50">
								<div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gray-700/50 p-3 flex items-center justify-center">
									<Users className="h-8 w-8 text-gray-500" />
								</div>
								<h3 className="text-lg font-medium text-white">
									No results found
								</h3>
								<p className="mt-2 text-gray-400">
									No matches found for "{searchQuery}". Try different keywords.
								</p>
							</div>
						) : searchQuery ? (
							<div className="bg-gray-800/50 rounded-2xl p-6 text-center border border-gray-700/50">
								<div className="mx-auto mb-4 h-14 w-14 rounded-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-3 flex items-center justify-center">
									<User className="h-8 w-8 text-purple-300" />
								</div>
								<h3 className="text-lg font-medium text-white">
									Search is a placeholder
								</h3>
								<p className="mt-2 text-gray-400">
									Search functionality will be implemented in a future update.
								</p>
							</div>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}
