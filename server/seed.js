/**
 * Social Network Test Data Generator
 *
 * This script generates realistic test data for the social network application,
 * including users, posts, comments, likes, and friend relationships.
 *
 * Usage:
 * 1. Save this file as seed.js in your server directory
 * 2. Make sure you have MongoDB running and your .env file configured
 * 3. Run the script with: node seed.js
 */

require("dotenv").config();

// ✅ Fixed locale configuration - directly import English locale
const { faker } = require("@faker-js/faker/locale/en");

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
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

// Generate realistic English post content
const generatePostContent = () => {
	// Create different types of post content
	const contentTypes = [
		// Personal update
		() => {
			const action = faker.helpers.arrayElement([
				"Just finished",
				"Finally completed",
				"Started",
				"Can't believe I just",
				"Excited to share that I",
				"Today I",
			]);

			const activity = faker.helpers.arrayElement([
				`working on my ${faker.word.adjective()} ${faker.commerce.product()}`,
				`reading "${faker.commerce.productName()}" by ${faker.person.fullName()}`,
				`visiting ${faker.location.city()}`,
				`trying out the new ${faker.commerce.productName()}`,
				`learning about ${faker.company.buzzNoun()}`,
				`${faker.word.verb()}ing for the first time`,
			]);

			const reaction = faker.helpers.arrayElement([
				"It was amazing!",
				"Highly recommend!",
				"Not sure how I feel about it yet.",
				"What a game changer!",
				"Anyone else tried this?",
				"Can't wait to do it again!",
				"",
			]);

			return `${action} ${activity}. ${reaction}`;
		},

		// Question
		() => {
			const question = faker.helpers.arrayElement([
				`Does anyone know a good ${faker.commerce.productAdjective()} ${faker.commerce.product()} in ${faker.location.city()}?`,
				`What's the best way to ${faker.word.verb()} a ${faker.commerce.product()}?`,
				`Looking for recommendations on ${faker.company.buzzNoun()} resources. Any suggestions?`,
				`Has anyone been to ${faker.location.city()} recently? Planning a trip next month.`,
				`Need advice on ${faker.commerce.productName()}. Worth the price?`,
				`Thinking about ${faker.word.verb()}ing this weekend. Good idea?`,
			]);

			return question;
		},

		// Opinion/thought
		() => {
			const thought = faker.helpers.arrayElement([
				`I think ${faker.company.buzzPhrase()}.`,
				`Unpopular opinion: ${faker.commerce.productName()} is actually ${faker.word.adjective()}.`,
				`Been reflecting on ${faker.company.buzzNoun()} lately. It's really changed how I see things.`,
				`The more I learn about ${faker.company.buzzNoun()}, the more I realize how little I know.`,
				`Sometimes you just have to ${faker.word.verb()} before you can ${faker.word.verb()}.`,
			]);

			const followUp = faker.helpers.maybe(
				() =>
					faker.helpers.arrayElement([
						" What do you all think?",
						" Agree or disagree?",
						" Am I wrong?",
						" Thoughts?",
						"",
					]),
				{ probability: 0.6 }
			);

			return thought + (followUp || "");
		},

		// Quote or inspiration
		() => {
			return faker.helpers.arrayElement([
				`"${faker.word.adjective().charAt(0).toUpperCase() + faker.word.adjective().slice(1)} people ${faker.word.verb()} because they ${faker.word.verb()}, not because they ${faker.word.verb()}." - ${faker.person.fullName()}`,
				`Just remembered this quote: "${faker.company.catchPhrase()}" - ${faker.person.lastName()}`,
				`Today's thought: ${faker.company.catchPhrase()}.`,
				`Reminder to self: ${faker.company.buzzPhrase()}.`,
			]);
		},
	];

	// Randomly select a content type
	const contentGenerator = faker.helpers.arrayElement(contentTypes);
	return contentGenerator();
};

// Generate realistic English comment content
const generateCommentContent = () => {
	const commentTypes = [
		// Agreement/positive
		() =>
			faker.helpers.arrayElement([
				"Totally agree with this!",
				`${faker.word.interjection()}! This is so ${faker.word.adjective()}!`,
				"Couldn't have said it better myself.",
				`Love this! Especially the part about ${faker.company.buzzNoun()}.`,
				"This resonates with me so much.",
				`I've been thinking the same thing about ${faker.commerce.product()}.`,
			]),

		// Question
		() =>
			faker.helpers.arrayElement([
				`Have you tried ${faker.commerce.productName()}?`,
				`What about ${faker.company.buzzNoun()}? Does that factor in?`,
				"How long did it take you to figure this out?",
				`Did you get this from ${faker.person.firstName()}?`,
				"Where can I learn more about this?",
			]),

		// Sharing experience
		() => {
			const intro = faker.helpers.arrayElement([
				"I had a similar experience with",
				"This reminds me of",
				"I once tried",
				"I've been working with",
				"Recently, I discovered",
			]);

			const subject = faker.helpers.arrayElement([
				`${faker.commerce.productName()}`,
				`a ${faker.word.adjective()} ${faker.commerce.product()}`,
				`${faker.company.buzzNoun()}`,
				`${faker.person.jobTitle()}`,
			]);

			const result = faker.helpers.arrayElement([
				"It was a game changer.",
				"It didn't work out well.",
				"It was exactly what I needed.",
				"Still not sure how I feel about it.",
				"It completely changed my perspective.",
			]);

			return `${intro} ${subject}. ${result}`;
		},
	];

	const commentGenerator = faker.helpers.arrayElement(commentTypes);
	return commentGenerator();
};

// Generate a test user with the given credentials
const createTestUser = async (email, password, username, fullName) => {
	try {
		const hashedPassword = await bcrypt.hash(password, 12);

		const testUser = new User({
			email,
			password: hashedPassword,
			passwordConfirm: password,
			username,
			fullName,
			bio: `Hi, I'm ${fullName.split(" ")[0]}! ${faker.person.bio()}`,
			location: faker.location.city() + ", " + faker.location.country(),
			website: faker.internet.url(),
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

// Generate random users
const generateUsers = async (count) => {
	const users = [];
	console.log(`Generating ${count} random users...`);

	for (let i = 0; i < count; i++) {
		try {
			const firstName = faker.person.firstName();
			const lastName = faker.person.lastName();
			const fullName = `${firstName} ${lastName}`;
			const username = faker.internet
				.userName({ firstName, lastName })
				.toLowerCase()
				.replace(/[^a-z0-9_]/g, "_");
			const email = faker.internet.email({ firstName, lastName }).toLowerCase();
			const password = "password123";
			const hashedPassword = await bcrypt.hash(password, 12);

			const user = new User({
				email,
				password: hashedPassword,
				passwordConfirm: password,
				username,
				fullName,
				bio: `Hi, I'm ${firstName}! ${faker.person.bio()}`,
				location: faker.location.city() + ", " + faker.location.country(),
				website: faker.internet.url(),
				birthday: faker.date.birthdate({ min: 18, max: 65, mode: "age" }),
				occupation: faker.person.jobTitle(),
				profilePicture: faker.image.avatar(),
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

// Generate posts for users
const generatePosts = async (users, postsPerUser, maxComments, maxLikes) => {
	const posts = [];
	let totalPosts = 0;
	console.log(`Generating up to ${postsPerUser} posts per user...`);

	const userIds = users.map((user) => user._id);

	for (const user of users) {
		const numPosts = Math.floor(Math.random() * postsPerUser) + 1;

		for (let i = 0; i < numPosts; i++) {
			try {
				const now = new Date();
				const isExpired = Math.random() < 0.2;
				let expiresAt;

				if (isExpired) {
					expiresAt = new Date(
						now.getTime() - Math.random() * 72 * 60 * 60 * 1000
					);
				} else {
					const hoursUntilExpiry = [1, 6, 12, 24, 48, 72, 168][
						Math.floor(Math.random() * 7)
					];
					expiresAt = new Date(
						now.getTime() + hoursUntilExpiry * 60 * 60 * 1000
					);
				}

				const renewalCount = Math.floor(Math.random() * 4);
				let renewedAt = null;

				if (renewalCount > 0) {
					const creationDate = new Date(
						now.getTime() - Math.random() * 48 * 60 * 60 * 1000
					);
					renewedAt = new Date(
						creationDate.getTime() + Math.random() * (now - creationDate)
					);
				}

				const numLikes = Math.floor(Math.random() * maxLikes);
				const likedBy = [];

				for (let j = 0; j < numLikes; j++) {
					const randomUserId =
						userIds[Math.floor(Math.random() * userIds.length)];
					if (
						randomUserId.toString() !== user._id.toString() &&
						!likedBy.some((id) => id.toString() === randomUserId.toString())
					) {
						likedBy.push(randomUserId);
					}
				}

				const numComments = Math.floor(Math.random() * maxComments);
				const comments = [];

				for (let j = 0; j < numComments; j++) {
					const randomUserId =
						userIds[Math.floor(Math.random() * userIds.length)];
					const commentDate = new Date(
						now.getTime() - Math.random() * 24 * 60 * 60 * 1000
					);

					comments.push({
						user: randomUserId,
						content: generateCommentContent(),
						createdAt: commentDate,
					});
				}

				comments.sort((a, b) => a.createdAt - b.createdAt);

				const post = new Post({
					user: user._id,
					content: generatePostContent(),
					likes: likedBy.length,
					likedBy,
					comments,
					expiresAt,
					renewalCount,
					renewedAt,
					createdAt: new Date(
						now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000
					),
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

// Main function to seed the database
const seedDatabase = async () => {
	try {
		await connectDB();
		await clearDatabase();

		console.log("Seeding database...");

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

		const randomUsers = await generateUsers(20);
		const allUsers = [adminUser, testUser1, testUser2, ...randomUsers];

		await generatePosts(allUsers, 10, 5, 8);

		console.log("Database seeded successfully!");
	} catch (err) {
		console.error("Error seeding database:", err);
	} finally {
		mongoose.disconnect();
		console.log("Disconnected from MongoDB");
	}
};

seedDatabase();
