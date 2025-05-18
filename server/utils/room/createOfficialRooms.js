const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const Room = require("../../models/roomModel");


dotenv.config({ path: "../../.env" });

const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
);

const connectDB = async () => {
    try {
        await mongoose.connect(DB);
        console.log("Database connection successful");
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1);
    }
};

const officialRooms = [
    {
        name: "Mental Health Support",
        description: "A safe space to discuss mental health challenges",
        category: "Support",
        roomType: "official",
        resetInterval: 168,
        nextResetAt: new Date(Date.now() + 168 * 60 * 60 * 1000)
    },
    {
        name: "Career Confessions",
        description: "Share your work struggles and triumphs anonymously",
        category: "Professional",
        roomType: "official",
        resetInterval: 168,
        nextResetAt: new Date(Date.now() + 168 * 60 * 60 * 1000)
    },
    {
        name: "Creative Writing",
        description: "Share your poetry and short stories",
        category: "Creative",
        roomType: "official",
        resetInterval: 168,
        nextResetAt: new Date(Date.now() + 168 * 60 * 60 * 1000)
    },
    {
        name: "Dating Stories",
        description: "The good, the bad, and the awkward dating experiences",
        category: "Relationships",
        roomType: "official",
        resetInterval: 168,
        nextResetAt: new Date(Date.now() + 168 * 60 * 60 * 1000)
    },
    {
        name: "Tech Confessions",
        description: "Admit your tech mistakes and shortcuts",
        category: "Technology",
        roomType: "official",
        resetInterval: 168,
        nextResetAt: new Date(Date.now() + 168 * 60 * 60 * 1000)
    },
    {
        name: "Unpopular Opinions",
        description: "Share your controversial takes in a judgment-free zone",
        category: "Discussion",
        roomType: "official",
        resetInterval: 168,
        nextResetAt: new Date(Date.now() + 168 * 60 * 60 * 1000)
    },
];

const createOfficialRooms = async () => {
    try {
        // Connect to database
        await connectDB();

        // Delete existing official rooms
        await Room.deleteMany({ roomType: "official" });
        console.log("Existing official rooms deleted");

        // Create new official rooms
        const rooms = await Room.create(officialRooms);
        console.log(`${rooms.length} official rooms created successfully`);

        // Disconnect from database
        await mongoose.connection.close();
        console.log("Database connection closed");
    } catch (err) {
        console.error("Error creating official rooms:", err);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Run the function
createOfficialRooms();