require("dotenv").config();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
);

const connectDB = async () => {
    await mongoose.connect(DB);
};

{[
    {
      name: "Mental Health Support",
      description: "A safe space to discuss mental health challenges",
      category: "Support",
    },
    {
      name: "Career Confessions",
      description: "Share your work struggles and triumphs anonymously",
      category: "Professional",
    },
    {
      name: "Creative Writing",
      description: "Share your poetry and short stories",
      category: "Creative",
    },
    {
      name: "Dating Stories",
      description: "The good, the bad, and the awkward dating experiences",
      category: "Relationships",
    },
    {
      name: "Tech Confessions",
      description: "Admit your tech mistakes and shortcuts",
      category: "Technology",
    },
    {
      name: "Unpopular Opinions",
      description: "Share your controversial takes in a judgment-free zone",
      category: "Discussion",
    },
  ]
}