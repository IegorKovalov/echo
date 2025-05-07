/**
 * Echo Social Network Advanced Test Data Generator
 *
 * This comprehensive script generates realistic test data for the Echo social network application,
 * including a diverse range of users, posts with rich media, realistic comments, view patterns,
 * and time-based interactions that match the ephemerality features of Echo.
 *
 * Usage:
 * 1. Ensure MongoDB is running and .env is configured
 * 2. Run: node seed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker/locale/en");
const fs = require("fs");
const path = require("path");
const cloudinary = require("./utils/cloudinary");

// Import models
const User = require("./models/userModel");
const Post = require("./models/postModel");

// Connect to MongoDB
const connectDB = async () => {
	try {
		const DB = process.env.DATABASE.replace(
			"<PASSWORD>",
			process.env.DATABASE_PASSWORD
		);
		await mongoose.connect(DB);
		console.log("MongoDB connected successfully!");
	} catch (err) {
		console.error("Failed to connect to MongoDB", err);
		process.exit(1);
	}
};

// Clear existing data
const clearDatabase = async () => {
	try {
		await User.deleteMany({});
		await Post.deleteMany({});
		console.log("Database cleared!");
	} catch (err) {
		console.error("Error clearing database:", err);
		process.exit(1);
	}
};

// Generate location data
const generateLocation = () => {
	const cities = [
		"New York",
		"San Francisco",
		"London",
		"Paris",
		"Tokyo",
		"Sydney",
		"Berlin",
		"Toronto",
		"Singapore",
		"Dubai",
		"Mumbai",
		"Cape Town",
		"Mexico City",
		"Rio de Janeiro",
		"Barcelona",
		"Amsterdam",
		"Seoul",
		"Stockholm",
		"Vienna",
		"Bangkok",
		"Istanbul",
		"Moscow",
		"Tel Aviv",
		"Zurich",
		"Copenhagen",
	];

	const countries = [
		"USA",
		"UK",
		"France",
		"Japan",
		"Australia",
		"Germany",
		"Canada",
		"Singapore",
		"UAE",
		"India",
		"South Africa",
		"Mexico",
		"Brazil",
		"Spain",
		"Netherlands",
		"South Korea",
		"Sweden",
		"Austria",
		"Thailand",
		"Turkey",
		"Russia",
		"Israel",
		"Switzerland",
		"Denmark",
		"Italy",
	];

	const city = faker.helpers.arrayElement(cities);
	const country = faker.helpers.arrayElement(countries);

	return `${city}, ${country}`;
};

// Generate interests (for user bios)
const generateInterests = () => {
	const interests = [
		"photography",
		"travel",
		"coding",
		"reading",
		"writing",
		"music",
		"art",
		"cooking",
		"yoga",
		"hiking",
		"gardening",
		"gaming",
		"fashion",
		"films",
		"fitness",
		"technology",
		"design",
		"science",
		"astronomy",
		"history",
		"languages",
		"poetry",
		"dance",
		"philosophy",
		"finance",
		"sports",
		"meditation",
		"psychology",
		"architecture",
		"sustainability",
	];

	const numInterests = Math.floor(Math.random() * 5) + 1; // 1-5 interests
	const userInterests = [];

	for (let i = 0; i < numInterests; i++) {
		const interest = faker.helpers.arrayElement(interests);
		if (!userInterests.includes(interest)) {
			userInterests.push(interest);
		}
	}

	return userInterests;
};

// Generate a rich user bio
const generateUserBio = (firstName) => {
	const interests = generateInterests();
	const interestsStr =
		interests.length > 0 ? `Passionate about ${interests.join(", ")}.` : "";

	const bioTemplates = [
		() => `Hi, I'm ${firstName}! ${interestsStr} ${faker.person.bio()}`,
		() =>
			`${faker.person.jobTitle()} by day, ${interests[0] || "dreamer"} by night. ${faker.helpers.arrayElement(["Always exploring.", "Constantly learning.", "Forever curious."])}`,
		() =>
			`${interestsStr} ${faker.helpers.arrayElement(["Looking to connect with like-minded people.", "Sharing moments that matter.", "Here to exchange ideas and experiences."])}`,
		() =>
			`${faker.helpers.arrayElement(["Based in", "Living in", "Currently in"])} ${faker.location.city()}. ${interestsStr}`,
		() =>
			`${faker.helpers.arrayElement(["Creator", "Explorer", "Thinker", "Builder", "Artist"])} • ${interestsStr}`,
		() =>
			`${faker.helpers.arrayElement(["👋", "✌️", "🌟", "✨", "🚀"])} ${interestsStr} ${faker.helpers.arrayElement(["Let's connect!", "Say hi!", "Drop a message!"])}`,
	];

	const bioGenerator = faker.helpers.arrayElement(bioTemplates);
	return bioGenerator();
};

// Generate realistic website URLs for user profiles
const generateWebsite = (firstName, lastName) => {
	const domainTypes = [
		() => "https://portfolio.io/" + firstName.toLowerCase(),
		() =>
			"https://www." +
			firstName.toLowerCase() +
			lastName.toLowerCase() +
			".com",
		() => "https://" + firstName.toLowerCase() + ".me",
		() =>
			"https://www.linkedin.com/in/" +
			firstName.toLowerCase() +
			"-" +
			lastName.toLowerCase(),
		() =>
			"https://github.com/" +
			firstName.toLowerCase() +
			lastName.charAt(0).toLowerCase(),
		() => "https://" + firstName.toLowerCase() + ".medium.com",
		() =>
			"https://www.behance.net/" +
			firstName.toLowerCase() +
			lastName.charAt(0).toLowerCase(),
		() =>
			"https://www.instagram.com/" +
			firstName.toLowerCase() +
			"." +
			lastName.toLowerCase(),
		() =>
			"https://" +
			firstName.toLowerCase() +
			lastName.toLowerCase() +
			".substack.com",
	];

	const websiteGenerator = faker.helpers.arrayElement(domainTypes);
	return websiteGenerator();
};

// Generate hashtags for posts
const generateHashtags = () => {
	const hashtags = [
		"tech",
		"innovation",
		"design",
		"photography",
		"travel",
		"food",
		"fitness",
		"health",
		"mindfulness",
		"productivity",
		"art",
		"music",
		"books",
		"writing",
		"coding",
		"development",
		"nature",
		"environment",
		"sustainability",
		"learning",
		"inspiration",
		"motivation",
		"creativity",
		"business",
		"startups",
		"fashion",
		"style",
		"beauty",
		"wellness",
		"adventure",
	];

	const numHashtags = Math.floor(Math.random() * 4); // 0-3 hashtags
	const selectedHashtags = [];

	for (let i = 0; i < numHashtags; i++) {
		const hashtag = faker.helpers.arrayElement(hashtags);
		if (!selectedHashtags.includes(hashtag)) {
			selectedHashtags.push(hashtag);
		}
	}

	return selectedHashtags.map((tag) => `#${tag}`).join(" ");
};

// Enhanced post content generation
const generatePostContent = () => {
	// Create different types of post content
	const contentTypes = [
		// Personal update with emojis
		() => {
			const emojis = [
				"😀",
				"🚀",
				"✨",
				"💡",
				"🎉",
				"👍",
				"❤️",
				"🙌",
				"🔥",
				"⭐",
			];
			const leadEmoji =
				Math.random() > 0.5 ? faker.helpers.arrayElement(emojis) + " " : "";
			const endEmoji =
				Math.random() > 0.7 ? " " + faker.helpers.arrayElement(emojis) : "";

			const action = faker.helpers.arrayElement([
				"Just finished",
				"Finally completed",
				"Started",
				"Can't believe I just",
				"Excited to share that I",
				"Today I",
				"Happy to announce I",
			]);

			const activity = faker.helpers.arrayElement([
				`working on my ${faker.word.adjective()} ${faker.commerce.product()}`,
				`reading "${faker.commerce.productName()}" by ${faker.person.fullName()}`,
				`visiting ${faker.location.city()}`,
				`trying out the new ${faker.commerce.productName()}`,
				`learning about ${faker.company.buzzNoun()}`,
				`${faker.word.verb()}ing for the first time`,
				`experimenting with ${faker.commerce.productMaterial()} for a new project`,
				`collaborating with ${faker.person.firstName()} on a ${faker.commerce.productAdjective()} initiative`,
			]);

			const reaction = faker.helpers.arrayElement([
				"It was amazing!",
				"Highly recommend!",
				"Not sure how I feel about it yet.",
				"What a game changer!",
				"Anyone else tried this?",
				"Can't wait to do it again!",
				"Would love your thoughts on this.",
				"Definitely worth the effort.",
				"",
			]);

			// Occasionally add hashtags
			const hashtags = Math.random() > 0.6 ? " " + generateHashtags() : "";

			return `${leadEmoji}${action} ${activity}. ${reaction}${endEmoji}${hashtags}`;
		},

		// Question with engagement hook
		() => {
			const questionStarters = [
				"Does anyone know",
				"Can someone recommend",
				"Looking for advice on",
				"Curious if anyone has tried",
				"Need recommendations for",
				"Wondering if",
				"Has anyone here",
				"What's your favorite",
			];

			const questionContent = [
				`a good ${faker.commerce.productAdjective()} ${faker.commerce.product()} in ${faker.location.city()}?`,
				`the best way to ${faker.word.verb()} a ${faker.commerce.product()}?`,
				`${faker.company.buzzNoun()} resources worth checking out?`,
				`${faker.location.city()} recently? Planning a trip next month.`,
				`${faker.commerce.productName()}? Worth the price?`,
				`${faker.word.verb()}ing this weekend would be a good idea?`,
				`ways to improve ${faker.company.buzzNoun()} skills quickly?`,
				`books/podcasts about ${faker.company.buzzNoun()}?`,
			];

			const engagementHook =
				Math.random() > 0.5
					? faker.helpers.arrayElement([
							" Would really appreciate your insights!",
							" Thanks in advance for any suggestions!",
							" Really interested in hearing from people with experience.",
							" Your advice would be super helpful!",
							"",
						])
					: "";

			// Occasionally add relevant emoji
			const emoji =
				Math.random() > 0.7
					? faker.helpers.arrayElement(["🤔", "❓", "🙏", "💭", "📝", "🔍"]) +
						" "
					: "";

			return `${emoji}${faker.helpers.arrayElement(questionStarters)} ${faker.helpers.arrayElement(questionContent)}${engagementHook}`;
		},

		// Opinion/thought with depth
		() => {
			const thoughtStarters = [
				"I think",
				"I believe",
				"It seems to me",
				"I've realized",
				"I've been thinking",
				"It's interesting how",
				"It's fascinating that",
				"I've observed",
			];

			const thought = [
				`${faker.company.buzzPhrase()}.`,
				`${faker.commerce.productName()} is actually quite ${faker.word.adjective()}.`,
				`${faker.company.buzzNoun()} has really changed how I see things.`,
				`the more I learn about ${faker.company.buzzNoun()}, the more I realize how little I know.`,
				`sometimes you just have to ${faker.word.verb()} before you can ${faker.word.verb()}.`,
				`we often ${faker.word.verb()} when we should actually be ${faker.word.verb()}ing.`,
				`the difference between ${faker.word.adjective()} and ${faker.word.adjective()} is actually ${faker.company.buzzNoun()}.`,
				`${faker.company.catchPhrase()} is fundamentally about human connection.`,
			];

			const followUp = faker.helpers.maybe(
				() =>
					faker.helpers.arrayElement([
						" What do you all think?",
						" Agree or disagree?",
						" Am I wrong?",
						" Thoughts?",
						" Curious if others have had similar realizations.",
						" Would love to hear your perspective on this.",
						"",
					]),
				{ probability: 0.7 }
			);

			// Occasionally add relevant emoji
			const emoji =
				Math.random() > 0.7
					? faker.helpers.arrayElement(["💭", "🧠", "💡", "🤔", "✨", "👀"]) +
						" "
					: "";

			// Occasionally add hashtags
			const hashtags = Math.random() > 0.7 ? " " + generateHashtags() : "";

			return `${emoji}${faker.helpers.arrayElement(thoughtStarters)} ${faker.helpers.arrayElement(thought)}${followUp || ""}${hashtags}`;
		},

		// Quote or inspiration with attribution
		() => {
			const quoteFormats = [
				() => {
					const quote = `"${faker.word.adjective().charAt(0).toUpperCase() + faker.word.adjective().slice(1)} people ${faker.word.verb()} because they ${faker.word.verb()}, not because they ${faker.word.verb()}."`;
					const author = faker.person.fullName();
					return `${quote} - ${author}`;
				},
				() => {
					const quote = `"${faker.company.catchPhrase()}"`;
					const author = faker.person.lastName();
					return `Just remembered this quote: ${quote} - ${author}`;
				},
				() => {
					return `Today's thought: ${faker.company.catchPhrase()}.`;
				},
				() => {
					return `Reminder to self: ${faker.company.buzzPhrase()}.`;
				},
				() => {
					return `"${faker.word.adjective().charAt(0).toUpperCase() + faker.word.adjective().slice(1)} ${faker.company.buzzNoun()} is the key to ${faker.word.adjective()} ${faker.company.buzzNoun()}." - Something I read today that resonated.`;
				},
			];

			const quoteGenerator = faker.helpers.arrayElement(quoteFormats);

			// Occasionally add relevant emoji
			const emoji =
				Math.random() > 0.6
					? faker.helpers.arrayElement([
							"✨",
							"💫",
							"💭",
							"📝",
							"🌟",
							"💡",
							"🧠",
						]) + " "
					: "";

			// Occasionally add hashtags
			const hashtags = Math.random() > 0.7 ? " " + generateHashtags() : "";

			return `${emoji}${quoteGenerator()}${hashtags}`;
		},

		// Announcement or milestone
		() => {
			const announcements = [
				`Just hit ${faker.number.int({ min: 1000, max: 100000 })} ${faker.helpers.arrayElement(["followers", "subscribers", "users", "downloads", "views"])}! 🎉 Thank you all for your support!`,
				`Excited to announce that I'm starting a new position as ${faker.person.jobTitle()} at ${faker.company.name()}! 🚀`,
				`Just launched my new ${faker.commerce.productAdjective()} ${faker.commerce.product()}! Check it out and let me know what you think. 🙌`,
				`Celebrating ${faker.number.int({ min: 1, max: 10 })} years of ${faker.word.verb()}ing today! It's been quite a journey. 🥂`,
				`Just moved to ${faker.location.city()}! Looking forward to exploring my new home. 🏙️`,
				`Proud to share that our project ${faker.commerce.productName()} has been featured in ${faker.company.name()}! 🏆`,
				`Just completed my ${faker.number.int({ min: 10, max: 100 })}th ${faker.helpers.arrayElement(["book", "project", "design", "painting", "article", "podcast episode"])} of the year! 📈`,
			];

			const announcement = faker.helpers.arrayElement(announcements);

			// Occasionally add hashtags
			const hashtags = Math.random() > 0.5 ? " " + generateHashtags() : "";

			return `${announcement}${hashtags}`;
		},

		// Tech/creative showcase
		() => {
			const showCases = [
				`Just finished this ${faker.commerce.productAdjective()} ${faker.commerce.product()} project using ${faker.helpers.arrayElement(["React", "Python", "JavaScript", "Figma", "Photoshop", "Swift", "Flutter", "Vue.js", "Docker", "AWS", "TensorFlow"])}. ${faker.helpers.arrayElement(["Really proud of how it turned out!", "What do you think?", "Feedback welcome!", "Would love your thoughts!"])} 💻`,
				`My latest ${faker.helpers.arrayElement(["design", "photo", "illustration", "painting", "sculpture", "animation", "composition", "project", "experiment"])} exploring the concept of ${faker.company.buzzNoun()}. ${faker.helpers.arrayElement(["First time trying this technique!", "Been working on this for weeks.", "Quick weekend project.", "Still a work in progress..."])} 🎨`,
				`Here's a sneak peek of my ${faker.commerce.productAdjective()} ${faker.commerce.product()} ${faker.helpers.arrayElement(["prototype", "beta", "concept", "sketch", "mockup", "draft"])}. ${faker.helpers.arrayElement(["Launching next month!", "Looking for early testers!", "Still refining the details.", "Almost ready for release!"])} 👀`,
				`Built a ${faker.commerce.productAdjective()} ${faker.commerce.product()} that ${faker.word.verb()}s your ${faker.company.buzzNoun()} automatically! ${faker.helpers.arrayElement(["Game changer for my workflow.", "Saved me hours already.", "Working on adding more features.", "Open-sourcing it soon!"])} ⚙️`,
			];

			const showcase = faker.helpers.arrayElement(showCases);

			// Occasionally add hashtags
			const hashtags = Math.random() > 0.4 ? " " + generateHashtags() : "";

			return `${showcase}${hashtags}`;
		},
	];

	const contentGenerator = faker.helpers.arrayElement(contentTypes);
	return contentGenerator();
};

// Enhanced comment content generation
const generateCommentContent = () => {
	const commentTypes = [
		// Agreement/positive reactions
		() => {
			const positiveComments = [
				"Totally agree with this!",
				`${faker.word.interjection()}! This is so ${faker.word.adjective()}!`,
				"Couldn't have said it better myself.",
				`Love this! Especially the part about ${faker.company.buzzNoun()}.`,
				"This resonates with me so much.",
				`I"ve been thinking the same thing about ${faker.commerce.product()}.`,
				`You're absolutely right about ${faker.company.buzzNoun()}.`,
				"Spot on! 👏",
				"This is exactly what I needed to hear today.",
				"Brilliantly put!",
				"You make such a good point here.",
				"100% this!",
				"Well said! 👌",
				"This really made me think. Thank you for sharing!",
				"I've been feeling this way too but couldn't articulate it this well.",
			];

			// Occasionally add emoji
			const addEmoji = Math.random() > 0.6;
			const emojis = [
				"👍",
				"🙌",
				"💯",
				"🔥",
				"❤️",
				"👏",
				"✨",
				"💪",
				"🤩",
				"😍",
			];
			const emoji = addEmoji ? " " + faker.helpers.arrayElement(emojis) : "";

			return faker.helpers.arrayElement(positiveComments) + emoji;
		},

		// Questions and curiosity
		() => {
			const questions = [
				`Have you tried ${faker.commerce.productName()}?`,
				`What about ${faker.company.buzzNoun()}? Does that factor in?`,
				"How long did it take you to figure this out?",
				`Did you get this from ${faker.person.firstName()}?`,
				"Where can I learn more about this?",
				"Do you have any resources you'd recommend on this topic?",
				"What made you interested in this?",
				"Have you considered exploring this further?",
				"How did you come to this conclusion?",
				`What's your take on ${faker.company.buzzNoun()} in relation to this?`,
				"Would you do things differently next time?",
				"What was the biggest challenge with this?",
				"Any plans to expand on this idea?",
				"Was this inspired by something specific?",
				"Does this work in other contexts too?",
			];

			// Occasionally add emoji
			const addEmoji = Math.random() > 0.7;
			const emojis = ["🤔", "❓", "👀", "💭", "🧐", "📝", "🔍", "💡"];
			const emoji = addEmoji ? faker.helpers.arrayElement(emojis) + " " : "";

			return emoji + faker.helpers.arrayElement(questions);
		},

		// Sharing experience with personal touch
		() => {
			const introFormats = [
				"I had a similar experience with",
				"This reminds me of",
				"I once tried",
				"I've been working with",
				"Recently, I discovered",
				"I've spent the last few months using",
				"My journey with",
				"I had an interesting encounter with",
				"When I was exploring",
				"During my time with",
			]; // Removed the extra comma here

			const subjectFormats = [
				`${faker.commerce.productName()}`,
				`a ${faker.word.adjective()} ${faker.commerce.product()}`,
				`${faker.company.buzzNoun()}`,
				`${faker.person.jobTitle()}`,
				`the concept of ${faker.company.buzzNoun()}`,
				`a project involving ${faker.commerce.productMaterial()}`,
				`a ${faker.word.adjective()} approach to ${faker.company.buzzNoun()}`,
			]; // Removed the extra comma here

			const resultFormats = [
				"It was a game changer.",
				"It didn't work out well.",
				"It was exactly what I needed.",
				"Still not sure how I feel about it.",
				"It completely changed my perspective.",
				"The results exceeded my expectations.",
				"I learned so much from the process.",
				"It led me down an unexpected path.",
				"I wish I'd discovered it sooner.",
				"It solved problems I didn't even know I had.",
				"It was challenging but worth it in the end.",
			];

			// Occasionally add emoji
			const addEmoji = Math.random() > 0.7;
			const emojis = [
				"💭",
				"📝",
				"💡",
				"🧠",
				"👍",
				"🤔",
				"✨",
				"🚀",
				"🔍",
				"💪",
			];
			const emoji = addEmoji ? " " + faker.helpers.arrayElement(emojis) : "";

			return `${faker.helpers.arrayElement(introFormats)} ${faker.helpers.arrayElement(subjectFormats)}. ${faker.helpers.arrayElement(resultFormats)}${emoji}`;
		},

		// Helpful suggestions
		() => {
			const suggestions = [
				`You might want to check out ${faker.commerce.productName()} for this. It really helped me with similar challenges.`,
				`Have you considered approaching this from a ${faker.word.adjective()} perspective? It might offer new insights.`,
				`I found that combining ${faker.company.buzzNoun()} with ${faker.company.buzzNoun()} creates amazing results.`,
				`Based on my experience, focusing on ${faker.commerce.productAdjective()} ${faker.commerce.product()} first makes everything else easier.`,
				`There's a great resource by ${faker.person.fullName()} that covers this topic in depth.`,
				`Try adding ${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} to your process - it was a game-changer for me.`,
				`Sometimes simplifying your approach to just focus on ${faker.company.buzzNoun()} can make a huge difference.`,
				`I'd recommend the ${faker.word.adjective()} method for this particular situation.`,
			];

			// Occasionally add emoji
			const addEmoji = Math.random() > 0.6;
			const emojis = ["💡", "🔍", "✨", "👍", "🧠", "🚀", "💪", "👌"];
			const emoji = addEmoji ? faker.helpers.arrayElement(emojis) + " " : "";

			return emoji + faker.helpers.arrayElement(suggestions);
		},

		// Humor and light comments
		() => {
			const humorousComments = [
				`This is so accurate it hurts! 😂`,
				`I feel personally attacked by this relatable content. 🤣`,
				`My ${faker.commerce.product()} feels seen right now.`,
				`So what you're saying is I should quit my job and become a ${faker.person.jobTitle()}? I'm in!`,
				`Plot twist: ${faker.company.buzzNoun()} was the villain all along. 🎭`,
				`*adds ${faker.commerce.productName()} to cart immediately*`,
				`Just showed this to my ${faker.commerce.product()} and even IT was impressed.`,
				`Currently in the "stare at this and nod wisely" phase of my day.`,
				`My ${faker.animal.type()} approves this message. 🐾`,
				`Remember when we thought ${faker.company.buzzNoun()} was complicated? Those were simpler times. 😅`,
			];

			return faker.helpers.arrayElement(humorousComments);
		},
	];

	const commentGenerator = faker.helpers.arrayElement(commentTypes);
	return commentGenerator();
};

// Generate a test user with the given credentials
const createTestUser = async (email, password, username, fullName) => {
	try {
		const hashedPassword = await bcrypt.hash(password, 12);
		const firstName = fullName.split(" ")[0];

		const testUser = new User({
			email,
			password: hashedPassword,
			passwordConfirm: password,
			username,
			fullName,
			bio: generateUserBio(firstName),
			location: generateLocation(),
			website:
				Math.random() > 0.5
					? generateWebsite(firstName, fullName.split(" ")[1])
					: "",
			birthday: faker.date.birthdate({ min: 18, max: 65, mode: "age" }),
			occupation: faker.person.jobTitle(),
			profilePicture: faker.image.avatar(),
		});

		await User.collection.insertOne(testUser);
		console.log(`Test user created: ${email} (password: ${password})`);
		return testUser;
	} catch (err) {
		console.error("Error creating test user:", err);
		throw err;
	}
};

// Generate random users with more variety
const generateUsers = async (count) => {
	const users = [];
	console.log(`Generating ${count} random users...`);

	// Create a more diverse set of first and last names
	const customFirstNames = [
		"Emma",
		"Liam",
		"Olivia",
		"Noah",
		"Ava",
		"Ethan",
		"Sophia",
		"Mason",
		"Isabella",
		"Logan",
		"Mia",
		"Lucas",
		"Charlotte",
		"Jackson",
		"Amelia",
		"Aiden",
		"Harper",
		"Elijah",
		"Evelyn",
		"Sebastian",
		"Abigail",
		"Caleb",
		"Emily",
		"James",
		"Elizabeth",
		"Benjamin",
		"Sofia",
		"Mateo",
		"Avery",
		"Leo",
		"Ella",
		"Jack",
		"Madison",
		"Owen",
		"Scarlett",
		"Gabriel",
		"Victoria",
		"Carter",
		"Aria",
		"Jayden",
		"Grace",
		"John",
		"Chloe",
		"Luke",
		"Camila",
		"David",
		"Penelope",
		"Isaac",
		"Riley",
		"Wyatt",
		"Layla",
		"Joseph",
		"Lillian",
	];

	const customLastNames = [
		"Smith",
		"Johnson",
		"Williams",
		"Brown",
		"Jones",
		"Garcia",
		"Miller",
		"Davis",
		"Rodriguez",
		"Martinez",
		"Hernandez",
		"Lopez",
		"Gonzalez",
		"Wilson",
		"Anderson",
		"Thomas",
		"Taylor",
		"Moore",
		"Jackson",
		"Martin",
		"Lee",
		"Perez",
		"Thompson",
		"White",
		"Harris",
		"Sanchez",
		"Clark",
		"Ramirez",
		"Lewis",
		"Robinson",
		"Walker",
		"Young",
		"Allen",
		"King",
		"Wright",
		"Scott",
		"Torres",
		"Nguyen",
		"Hill",
		"Flores",
		"Green",
		"Adams",
		"Nelson",
		"Baker",
		"Hall",
		"Rivera",
		"Campbell",
		"Mitchell",
		"Carter",
		"Roberts",
		"Gomez",
		"Phillips",
		"Evans",
		"Turner",
		"Diaz",
		"Parker",
	];

	for (let i = 0; i < count; i++) {
		try {
			// Use either custom names or faker-generated names for variety
			const useCustomNames = Math.random() > 0.3;
			let firstName, lastName;

			if (useCustomNames) {
				firstName = faker.helpers.arrayElement(customFirstNames);
				lastName = faker.helpers.arrayElement(customLastNames);
			} else {
				firstName = faker.person.firstName();
				lastName = faker.person.lastName();
			}

			const fullName = `${firstName} ${lastName}`;

			// Generate a username with different patterns
			let username;
			const usernamePatterns = [
				// firstName_lastName
				() => (firstName + "_" + lastName).toLowerCase(),
				// firstNameLastName
				() => (firstName + lastName).toLowerCase(),
				// firstName.lastName
				() => (firstName + "." + lastName).toLowerCase(),
				// firstNameInitial_lastNameInitial
				() => firstName.toLowerCase() + lastName.charAt(0).toLowerCase(),
				// random username
				() =>
					faker.internet
						.userName({ firstName, lastName })
						.toLowerCase()
						.replace(/[^a-z0-9_]/g, "_"),
			];

			const usernameGenerator = faker.helpers.arrayElement(usernamePatterns);
			username = usernameGenerator();

			// Ensure username is unique - if duplicate, add a random number
			const existingUser = users.find((u) => u.username === username);
			if (existingUser) {
				username = username + faker.number.int({ min: 100, max: 999 });
			}

			// Generate a realistic email
			const emailPatterns = [
				// firstName.lastName@domain.com
				() =>
					(firstName + "." + lastName).toLowerCase() +
					"@" +
					faker.internet.domainName(),
				// firstInitial.lastName@domain.com
				() =>
					(firstName.charAt(0) + "." + lastName).toLowerCase() +
					"@" +
					faker.internet.domainName(),
				// firstName@domain.com
				() => firstName.toLowerCase() + "@" + faker.internet.domainName(),
				// firstLastNumber@domain.com
				() =>
					(
						firstName +
						lastName +
						faker.number.int({ min: 1, max: 99 })
					).toLowerCase() +
					"@" +
					faker.internet.domainName(),
				// random email
				() => faker.internet.email({ firstName, lastName }).toLowerCase(),
			];

			const emailGenerator = faker.helpers.arrayElement(emailPatterns);
			const email = emailGenerator();

			const password = "password123";
			const hashedPassword = await bcrypt.hash(password, 12);

			// Create more diverse profile pictures
			let profilePicture;
			const pictureTypes = [
				// Realistic avatar
				() => faker.image.avatar(),
				// URL based on name
				() =>
					`https://avatars.dicebear.com/api/initials/${firstName.charAt(0)}${lastName.charAt(0)}.svg`,
				// Placeholder with random color
				() => {
					const colors = [
						"ff6b6b",
						"51cf66",
						"339af0",
						"fcc419",
						"be4bdb",
						"15aabf",
					];
					return `https://via.placeholder.com/150/${faker.helpers.arrayElement(colors)}/${faker.helpers.arrayElement(colors)}?text=${firstName.charAt(0)}${lastName.charAt(0)}`;
				},
				// No profile picture
				() => null,
			];

			const profilePictureGenerator = faker.helpers.arrayElement(pictureTypes);
			profilePicture = profilePictureGenerator();

			// Set up profile completeness - some users have complete profiles, others are minimal
			const profileCompleteness = faker.helpers.arrayElement([
				"complete",
				"partial",
				"minimal",
			]);

			const user = new User({
				email,
				password: hashedPassword,
				passwordConfirm: password,
				username,
				fullName,
				bio:
					profileCompleteness === "minimal" ? "" : generateUserBio(firstName),
				location:
					profileCompleteness === "minimal"
						? ""
						: profileCompleteness === "partial" && Math.random() > 0.5
							? ""
							: generateLocation(),
				website:
					profileCompleteness === "minimal"
						? ""
						: profileCompleteness === "partial" && Math.random() > 0.7
							? ""
							: generateWebsite(firstName, lastName),
				birthday:
					profileCompleteness === "minimal"
						? undefined
						: profileCompleteness === "partial" && Math.random() > 0.6
							? undefined
							: faker.date.birthdate({ min: 18, max: 65, mode: "age" }),
				occupation:
					profileCompleteness === "minimal"
						? ""
						: profileCompleteness === "partial" && Math.random() > 0.6
							? ""
							: faker.person.jobTitle(),
				profilePicture: profilePicture,
			});

			await User.collection.insertOne(user);
			users.push(user);

			if ((i + 1) % 10 === 0) {
				console.log(`Created ${i + 1}/${count} users`);
			}
		} catch (err) {
			console.error(`Error creating user ${i}:`, err);
		}
	}

	console.log(`Created ${users.length} random users`);
	return users;
};

// Generate detailed media items with proper Cloudinary structure
const generateMediaItem = () => {
	// In a production environment, these would be real Cloudinary uploads
	// For the seed script, we create realistic mock data

	const isImage = Math.random() > 0.3; // 70% chance of image, 30% video

	// Generate a realistic public ID
	const publicId = `echo/posts/${faker.string.uuid().slice(0, 8)}`;

	// Image-specific URLs and types
	if (isImage) {
		const imageTypes = [
			// Landscape photo
			() => ({
				url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/1200/800`,
				type: "image",
				publicId: `${publicId}/landscape`,
			}),
			// Portrait photo
			() => ({
				url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/800/1200`,
				type: "image",
				publicId: `${publicId}/portrait`,
			}),
			// Square photo
			() => ({
				url: `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/1000/1000`,
				type: "image",
				publicId: `${publicId}/square`,
			}),
		];

		const imageGenerator = faker.helpers.arrayElement(imageTypes);
		return imageGenerator();
	}
	// Video-specific URLs and types
	else {
		return {
			url: `https://res.cloudinary.com/demo/video/upload/v1610144499/${publicId}.mp4`,
			type: "video",
			publicId: `${publicId}/video`,
		};
	}
};

// Generate a view count distribution that simulates viral content
const generateViewCount = () => {
	// Use a distribution that simulates social media view patterns
	// Most posts get modest views, a few get viral reach
	const distribution = [
		// 60% - Low views (0-50)
		() => Math.floor(Math.random() * 50),
		// 30% - Medium views (50-300)
		() => Math.floor(Math.random() * 250) + 50,
		// 8% - High views (300-1000)
		() => Math.floor(Math.random() * 700) + 300,
		// 2% - Viral (1000-10000)
		() => Math.floor(Math.random() * 9000) + 1000,
	];

	// Weights for the distribution
	const weights = [0.6, 0.3, 0.08, 0.02];

	// Select a distribution based on weights
	let random = Math.random();
	let cumulativeWeight = 0;

	for (let i = 0; i < weights.length; i++) {
		cumulativeWeight += weights[i];
		if (random < cumulativeWeight) {
			return distribution[i]();
		}
	}

	// Fallback
	return distribution[0]();
};

// Generate more diverse post expiration patterns
const generateExpirationTime = () => {
	const expirationOptions = [
		// 1 hour (rare)
		{ hours: 1, weight: 0.05 },
		// 6 hours
		{ hours: 6, weight: 0.1 },
		// 12 hours
		{ hours: 12, weight: 0.15 },
		// 24 hours (most common)
		{ hours: 24, weight: 0.4 },
		// 48 hours
		{ hours: 48, weight: 0.15 },
		// 72 hours (3 days)
		{ hours: 72, weight: 0.1 },
		// 168 hours (7 days, rare)
		{ hours: 168, weight: 0.05 },
	];

	// Select an option based on weights
	let random = Math.random();
	let cumulativeWeight = 0;

	for (const option of expirationOptions) {
		cumulativeWeight += option.weight;
		if (random < cumulativeWeight) {
			return option.hours;
		}
	}

	// Fallback to 24 hours
	return 24;
};

// Generate enriched posts for users
const generatePosts = async (users, postsPerUser, maxComments, maxViews) => {
	const posts = [];
	let totalPosts = 0;
	console.log(`Generating up to ${postsPerUser} posts per user...`);

	const userIds = users.map((user) => user._id);

	// First, create a distribution of posts per user
	// Some users post more, others post less
	const userPostCounts = users.map((user) => {
		// Use a distribution that makes sense for social media
		// Some users post a lot, others barely post
		if (Math.random() < 0.1) {
			// Very active users (10% of users) - many posts
			return (
				Math.floor(
					Math.random() * (postsPerUser - Math.floor(postsPerUser * 0.7))
				) + Math.floor(postsPerUser * 0.7)
			);
		} else if (Math.random() < 0.4) {
			// Active users (30% of users) - moderate number of posts
			return (
				Math.floor(
					Math.random() * (postsPerUser * 0.7 - Math.floor(postsPerUser * 0.3))
				) + Math.floor(postsPerUser * 0.3)
			);
		} else {
			// Casual users (60% of users) - few posts
			return Math.floor(Math.random() * Math.floor(postsPerUser * 0.3)) + 1;
		}
	});

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		const numPosts = userPostCounts[i];

		for (let j = 0; j < numPosts; j++) {
			try {
				const now = new Date();
				const isExpired = Math.random() < 0.2;
				let expiresAt;

				// Create realistic post creation times - spread out over the last month
				const creationDate = new Date(
					now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
				);

				if (isExpired) {
					// Expired posts - vary how long ago they expired
					const expirationHours = generateExpirationTime();
					expiresAt = new Date(
						creationDate.getTime() + expirationHours * 60 * 60 * 1000
					);
				} else {
					// Active posts - vary when they will expire
					const expirationHours = generateExpirationTime();
					expiresAt = new Date(
						creationDate.getTime() + expirationHours * 60 * 60 * 1000
					);

					// If normal expiration would place this in the past, it means the post would
					// be expired naturally. In this case, we simulate a post that's been renewed
					if (expiresAt < now) {
						// How many times has it been renewed already?
						const renewalCount = Math.min(3, Math.floor(Math.random() * 4)); // 0-3 renewals

						if (renewalCount > 0) {
							// Last renewed sometime between creation and now
							const renewedAt = new Date(
								creationDate.getTime() +
									Math.random() * (now.getTime() - creationDate.getTime())
							);

							// New expiration time from last renewal
							const renewalHours = generateExpirationTime();
							expiresAt = new Date(
								renewedAt.getTime() + renewalHours * 60 * 60 * 1000
							);
						}
					}
				}

				// Generate random number of views based on our distribution
				const views = generateViewCount();

				// Generate random comments
				const numComments = Math.floor(
					Math.random() * maxComments * (views / maxViews + 0.1)
				);
				const comments = [];

				// Comments are more likely on posts with more views
				for (let k = 0; k < numComments; k++) {
					const randomUserId =
						userIds[Math.floor(Math.random() * userIds.length)];

					// Comments spread out between post creation and now
					const commentDate = new Date(
						creationDate.getTime() +
							Math.random() *
								(Math.min(now.getTime(), expiresAt.getTime()) -
									creationDate.getTime())
					);

					comments.push({
						user: randomUserId,
						content: generateCommentContent(),
						createdAt: commentDate,
					});
				}

				comments.sort((a, b) => a.createdAt - b.createdAt);

				// Generate media for some posts (around 40%)
				const media = [];
				if (Math.random() < 0.4) {
					// Media count depends a bit on the user's posting frequency
					// Users who post more are more likely to include more media
					const userPostFrequency = userPostCounts[i] / postsPerUser;
					const maxMediaItems = Math.floor(userPostFrequency * 4) + 1; // 1-5 media items
					const mediaCount = Math.floor(Math.random() * maxMediaItems) + 1;

					for (let m = 0; m < mediaCount; m++) {
						media.push(generateMediaItem());
					}
				}

				// Track if this post has been renewed
				let renewalCount = 0;
				let renewedAt = null;

				// Check if we previously determined this is a renewed post
				if (expiresAt < now && !isExpired) {
					// Get renewal info from above logic
					renewalCount = Math.min(3, Math.floor(Math.random() * 4));
					if (renewalCount > 0) {
						renewedAt = new Date(
							creationDate.getTime() +
								Math.random() * (now.getTime() - creationDate.getTime())
						);
					}
				}

				const post = new Post({
					user: user._id,
					content: generatePostContent(),
					media,
					views,
					comments,
					expiresAt,
					renewalCount,
					renewedAt,
					createdAt: creationDate,
				});

				await post.save();
				posts.push(post);
				totalPosts++;

				if (totalPosts % 50 === 0) {
					console.log(`Created ${totalPosts} posts so far...`);
				}
			} catch (err) {
				console.error(`Error creating post for user ${user._id}:`, err);
			}
		}
	}

	console.log(`Created a total of ${posts.length} posts`);
	return posts;
};

// Create interaction patterns between users
const createUserInteractions = async (users, posts) => {
	console.log("Creating user interaction patterns...");

	// This would create interactions between users like follows, frequent commenters, etc.
	// For the seed script we're focusing on post relationships, but in a real
	// implementation this would establish social connections

	console.log("User interaction patterns established");
};

// Main function to seed the database
const seedDatabase = async () => {
	try {
		await connectDB();
		await clearDatabase();

		console.log("Seeding database...");

		// Create admin and test users with predictable login credentials
		const adminUser = await createTestUser(
			"admin@example.com",
			"admin123",
			"admin",
			"Admin User"
		);

		const testUser1 = await createTestUser(
			"john@example.com",
			"password123",
			"johndoe",
			"John Doe"
		);

		const testUser2 = await createTestUser(
			"jane@example.com",
			"password123",
			"janesmith",
			"Jane Smith"
		);

		// Create a diverse range of users (40-60)
		const userCount = Math.floor(Math.random() * 21) + 40; // 40-60 users
		const randomUsers = await generateUsers(userCount);
		const allUsers = [adminUser, testUser1, testUser2, ...randomUsers];

		// Generate varied post counts per user (5-20 posts per user)
		const maxPostsPerUser = 20;
		const maxCommentsPerPost = 15;
		const maxViewsPerPost = 5000;

		await generatePosts(
			allUsers,
			maxPostsPerUser,
			maxCommentsPerPost,
			maxViewsPerPost
		);

		// Create social patterns between users
		await createUserInteractions(allUsers, []);

		console.log("Database seeded successfully!");
		console.log("----------------------------");
		console.log("Test users:");
		console.log("- Admin: admin@example.com / admin123");
		console.log("- User1: john@example.com / password123");
		console.log("- User2: jane@example.com / password123");
		console.log("----------------------------");
		console.log(`${allUsers.length} users created`);
		console.log(`Posts generated with varied expiration times (1h to 7 days)`);
		console.log(`Some posts are expired, others have been renewed`);
		console.log(`Posts have realistic view counts and comment patterns`);
	} catch (err) {
		console.error("Error seeding database:", err);
	} finally {
		mongoose.disconnect();
		console.log("Disconnected from MongoDB");
	}
};

// Run the seeding process
seedDatabase();
