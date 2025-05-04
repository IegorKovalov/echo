import {
	Clock,
	Eye,
	Image as ImageIcon,
	MessageCircle,
	MessageSquare,
	Mic,
	PlusCircle,
	Search,
	Send,
	Sparkles,
	TrendingUp,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PostForm from "../components/UI/PostForm";
import PostItem from "../components/UI/PostItem";
import ProfileAvatar from "../components/UI/ProfileAvatar";
import { useAuth } from "../context/AuthContext";
import PostService from "../services/post.service";

export default function HomePage() {
	const { user, loading } = useAuth();
	const [posts, setPosts] = useState([]);
	const [trendingPosts, setTrendingPosts] = useState([]);
	const [loadingPosts, setLoadingPosts] = useState(true);
	const [loadingTrending, setLoadingTrending] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Load posts from API
	useEffect(() => {
		const fetchPosts = async () => {
			if (!user) return;

			try {
				setLoadingPosts(true);
				const response = await PostService.getAllPosts();
				setPosts(response.data.posts || []);
			} catch (error) {
				console.error("Error fetching posts:", error);
			} finally {
				setLoadingPosts(false);
			}
		};

		fetchPosts();
	}, [user]);

	// Load trending posts
	useEffect(() => {
		const fetchTrendingPosts = async () => {
			if (!user) return;

			try {
				setLoadingTrending(true);
				const response = await PostService.getTrendingPosts();
				setTrendingPosts(response.data.posts || []);
			} catch (error) {
				console.error("Error fetching trending posts:", error);
			} finally {
				setLoadingTrending(false);
			}
		};

		fetchTrendingPosts();
	}, [user]);

	// Handle post creation
	const handleCreatePost = async (formData) => {
		try {
			setIsSubmitting(true);
			await PostService.createPost(formData);

			// Refresh posts after creating a new one
			const response = await PostService.getAllPosts();
			setPosts(response.data.posts || []);
		} catch (error) {
			console.error("Error creating post:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Get hours left until expiration
	const getHoursLeft = (expiresAt) => {
		if (!expiresAt) return 0;
		return Math.ceil((new Date(expiresAt) - new Date()) / (1000 * 60 * 60));
	};

	// If still loading, show loading state
	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-950">
				<div className="text-center">
					<Sparkles className="mx-auto h-12 w-12 animate-pulse text-purple-500" />
					<p className="mt-4 text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col bg-gradient-to-b from-gray-900 to-gray-950">
			<main className="flex-1">
				<div className="container grid grid-cols-1 gap-6 px-4 py-6 md:grid-cols-3 lg:grid-cols-4">
					{/* Messenger Placeholder Sidebar */}
					<div className="hidden md:block md:col-span-1">
						<div className="sticky top-20 rounded-xl border border-gray-800 bg-gray-900 p-4">
							<div className="mb-4 flex items-center justify-between">
								<h3 className="font-medium text-white flex items-center gap-2">
									<MessageSquare className="h-5 w-5 text-purple-400" />
									Messages{" "}
									<span className="text-xs text-gray-500">(Coming Soon)</span>
								</h3>
								<button className="rounded-full p-1 hover:bg-gray-800 text-purple-400">
									<PlusCircle className="h-5 w-5" />
								</button>
							</div>

							<div className="relative mb-4">
								<input
									type="text"
									placeholder="Search messages"
									className="w-full rounded-lg border border-gray-800 bg-gray-800 pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
									disabled
								/>
								<Search className="absolute left-3 top-2 h-4 w-4 text-gray-500" />
							</div>

							<div className="space-y-1 opacity-60">
								{/* Placeholder message items */}
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-not-allowed"
									>
										<div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-900/50 to-blue-900/50" />
										<div className="flex-1 min-w-0">
											<p className="font-medium text-white truncate">
												Friend {i}
											</p>
											<p className="text-xs text-gray-400 truncate">
												Coming soon in future update...
											</p>
										</div>
										<div className="w-2 h-2 rounded-full bg-purple-500"></div>
									</div>
								))}
							</div>

							<div className="mt-6 text-center">
								<p className="text-xs text-gray-500">
									Messaging functionality will be available in an upcoming
									update.
								</p>
								<Link
									to="/profile"
									className="mt-4 inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
								>
									<Users className="h-4 w-4" />
									View your profile
								</Link>
							</div>
						</div>
					</div>

					{/* Main Content Area */}
					<div className="md:col-span-2 lg:col-span-2">
						{/* Post Form */}
						<PostForm
							user={user}
							onSubmit={handleCreatePost}
							isSubmitting={isSubmitting}
						/>

						{/* Posts Feed */}
						<div className="space-y-6">
							{loadingPosts ? (
								<div className="text-center py-10">
									<Sparkles className="mx-auto h-8 w-8 animate-pulse text-purple-500" />
									<p className="mt-2 text-gray-400">Loading posts...</p>
								</div>
							) : posts.length > 0 ? (
								posts
									.filter((post) => !post.expired)
									.map((post) => (
										<PostItem key={post._id} post={post} currentUser={user} />
									))
							) : (
								<div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
									<div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-800 p-4">
										<MessageCircle className="h-8 w-8 text-gray-600" />
									</div>
									<h3 className="text-lg font-medium text-white">
										No posts yet
									</h3>
									<p className="mt-2 text-gray-400">
										Create your first Echo or follow more users to see their
										posts.
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Trending Sidebar */}
					<div className="hidden lg:block lg:col-span-1">
						<div className="sticky top-20 rounded-xl border border-gray-800 bg-gray-900 p-4">
							<h3 className="mb-4 font-medium text-white flex items-center gap-2">
								<TrendingUp className="h-5 w-5 text-purple-400" />
								Trending Echoes
							</h3>

							{loadingTrending ? (
								<div className="py-12 text-center">
									<Sparkles className="mx-auto h-6 w-6 animate-pulse text-purple-500" />
									<p className="mt-2 text-xs text-gray-400">
										Loading trends...
									</p>
								</div>
							) : trendingPosts.length === 0 ? (
								<div className="py-8 text-center">
									<p className="text-sm text-gray-400">No trending posts yet</p>
								</div>
							) : (
								<div className="space-y-4">
									{trendingPosts.map((post) => (
										<div
											key={post._id}
											className="rounded-lg bg-gray-800/50 p-3 hover:bg-gray-800 transition-colors"
										>
											<div className="flex items-center gap-2 mb-2">
												<ProfileAvatar user={post.user} size="xs" />
												<span className="text-xs font-medium text-white truncate">
													{post.user.fullName}
												</span>
											</div>

											<p className="text-xs text-gray-300 mb-2 line-clamp-2">
												{post.content}
											</p>

											<div className="flex items-center justify-between text-xs text-gray-400">
												<div className="flex items-center gap-4">
													<div className="flex items-center gap-1">
														<Eye className="h-3 w-3" />
														<span>{post.views}</span>
													</div>
													<div className="flex items-center gap-1">
														<MessageCircle className="h-3 w-3" />
														<span>{post.comments?.length || 0}</span>
													</div>
												</div>
												<div className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													<span>{getHoursLeft(post.expiresAt)}h left</span>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
