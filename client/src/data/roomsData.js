// Shared room data and constants
export const categoryColors = {
	Support: "bg-green-600/20 text-green-400 border-green-600/30",
	Professional: "bg-blue-600/20 text-blue-400 border-blue-600/30",
	Creative: "bg-purple-600/20 text-purple-400 border-purple-600/30",
	Relationships: "bg-pink-600/20 text-pink-400 border-pink-600/30",
	Technology: "bg-cyan-600/20 text-cyan-400 border-cyan-600/30",
	Discussion: "bg-orange-600/20 text-orange-400 border-orange-600/30",
};

export const anonymousColors = [
	"bg-purple-600/20 text-purple-400",
	"bg-blue-600/20 text-blue-400",
	"bg-green-600/20 text-green-400",
	"bg-pink-600/20 text-pink-400",
	"bg-orange-600/20 text-orange-400",
	"bg-cyan-600/20 text-cyan-400",
	"bg-red-600/20 text-red-400",
	"bg-yellow-600/20 text-yellow-400",
];

export const categories = [
	"All",
	"Support",
	"Professional",
	"Creative",
	"Relationships",
	"Technology",
	"Discussion",
];

// Mock rooms data - in real app, this would come from API
export const mockRooms = [
	{
		_id: "1",
		name: "Mental Health Support",
		description:
			"A safe space to discuss mental health challenges and find support",
		category: "Support",
		roomType: "official",
		resetInterval: 168,
		nextResetAt: new Date(Date.now() + 168 * 60 * 60 * 1000),
		expiresAt: null,
		participantCount: 127,
		maxParticipants: null,
		createdBy: null,
		createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
	},
	{
		_id: "2",
		name: "Career Confessions",
		description: "Share your work struggles and triumphs anonymously",
		category: "Professional",
		roomType: "official",
		resetInterval: 168,
		nextResetAt: new Date(Date.now() + 168 * 60 * 60 * 1000),
		expiresAt: null,
		participantCount: 89,
		maxParticipants: null,
		createdBy: null,
		createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
	},
	{
		_id: "3",
		name: "Creative Writing Circle",
		description:
			"Share your poetry, short stories, and creative writing pieces",
		category: "Creative",
		roomType: "official",
		resetInterval: 168,
		nextResetAt: new Date(Date.now() + 168 * 60 * 60 * 1000),
		expiresAt: null,
		participantCount: 156,
		maxParticipants: null,
		createdBy: null,
		createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
	},
	{
		_id: "4",
		name: "Dating Stories",
		description: "The good, the bad, and the awkward dating experiences",
		category: "Relationships",
		roomType: "official",
		resetInterval: 168,
		nextResetAt: new Date(Date.now() + 168 * 60 * 60 * 1000),
		expiresAt: null,
		participantCount: 203,
		maxParticipants: null,
		createdBy: null,
		createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
	},
	{
		_id: "5",
		name: "Late Night Thoughts",
		description: "A place for those midnight reflections and random musings",
		category: "Discussion",
		roomType: "user-created",
		resetInterval: 24,
		nextResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
		expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		participantCount: 45,
		maxParticipants: 100,
		createdBy: "user123",
		createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
	},
	{
		_id: "6",
		name: "Tech Startup Stories",
		description: "Share your startup experiences, failures, and successes",
		category: "Technology",
		roomType: "user-created",
		resetInterval: 72,
		nextResetAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
		expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		participantCount: 78,
		maxParticipants: 200,
		createdBy: "user456",
		createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
	},
];

// Mock messages data
export const mockMessages = [
	{
		_id: "msg1",
		content:
			"Just wanted to share that I've been struggling with anxiety lately. Some days are harder than others, but I'm trying to take it one day at a time.",
		timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
		anonymousId: "user_42A8",
		isOwn: false,
	},
	{
		_id: "msg2",
		content:
			"Thank you for sharing that. You're not alone in this. I've found that breathing exercises really help when the anxiety gets overwhelming. Have you tried any mindfulness techniques?",
		timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
		anonymousId: "user_7F2B",
		isOwn: false,
	},
	{
		_id: "msg3",
		content:
			"I appreciate the support. I've tried meditation apps but sometimes it's hard to focus. Do you have any specific recommendations?",
		timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
		anonymousId: "user_42A8",
		isOwn: false,
	},
	{
		_id: "msg4",
		content:
			"I use Headspace and really like their anxiety-specific sessions. The 3-minute breathing space is perfect when you're feeling overwhelmed. Also, just talking here helps too - this community is really supportive.",
		timestamp: new Date(Date.now() - 45 * 60 * 1000),
		anonymousId: "user_7F2B",
		isOwn: false,
	},
	{
		_id: "msg5",
		content:
			"Same here! This room has been a lifesaver for me. Sometimes just knowing others understand what you're going through makes all the difference.",
		timestamp: new Date(Date.now() - 30 * 60 * 1000),
		anonymousId: "user_9K4L",
		isOwn: true,
	},
];

// Utility functions for room data
export const getRoomById = (id) => {
	return mockRooms.find((room) => room._id === id);
};

export const filterRoomsByCategory = (rooms, category) => {
	if (category === "All") return rooms;
	return rooms.filter((room) => room.category === category);
}; 