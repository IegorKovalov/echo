const crypto = require("crypto");

exports.generateAnonymousIdentity = (userId, roomId) => {
  const anonymousId = crypto
    .createHash("sha256")
    .update(`${userId}-${roomId}-${Date.now()}`)
    .digest("hex")
    .substring(0, 10);

  const anonymousName = `Anonymous-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    anonymousId,
    anonymousName,
  };
};

exports.getOfficialRoomTemplates = () => {
  return [
    {
      name: "Mental Health Support",
      description: "A safe space to discuss mental health challenges anonymously",
      duration: 168,
      maxUsers: 100,
      officialName: "Echo Team",
      isOfficial: true,
    },
    {
      name: "Career Confessions",
      description: "Share your workplace stories and career dilemmas",
      duration: 168,
      maxUsers: 100,
      officialName: "Echo Team",
      isOfficial: true,
    },
    {
      name: "Creative Writing",
      description: "Share your writing and get anonymous feedback",
      duration: 168,
      maxUsers: 100,
      officialName: "Echo Team",
      isOfficial: true,
    },
    {
      name: "Tech Talk",
      description: "Discuss technology without judgment or bias",
      duration: 168,
      maxUsers: 100,
      officialName: "Echo Team",
      isOfficial: true,
    },
    {
      name: "Daily Confessions",
      description: "Share your thoughts, secrets, and confessions",
      duration: 168,
      maxUsers: 100,
      officialName: "Echo Team",
      isOfficial: true,
    },
  ];
}; 