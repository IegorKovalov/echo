const Friend = require("../models/friendModel");
const User = require("../models/userModel");

exports.getFriends = async (req, res) => {
  try {
    const friends = await Friend.find({
      $or: [
        { requester: req.user._id, status: "accepted" },
        { recipient: req.user._id, status: "accepted" },
      ],
    })
      .populate({
        path: "requester",
        select: "username fullName profilePicture",
      })
      .populate({
        path: "recipient",
        select: "username fullName profilePicture",
      });
    const friendUsers = friends.map((friend) => {
      // If current user is the requester, return the recipient as friend
      if (friend.requester._id.toString() === req.user._id.toString()) {
        return friend.recipient;
      }
      // Otherwise return the requester as friend
      return friend.requester;
    });

    res.status(200).json({
      status: "success",
      results: friendUsers.length,
      data: {
        friends: friendUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Error retrieving friends",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getIncomingRequests = async (req, res) => {
  try {
    const requests = await Friend.find({
      recipient: req.user._id,
      status: "pending",
    }).populate({
      path: "requester",
      select: "username fullName profilePicture",
    });

    res.status(200).json({
      status: "success",
      results: requests.length,
      data: {
        requests,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Error retrieving incoming friend requests",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getOutgoingRequests = async (req, res) => {
  try {
    const requests = await Friend.find({
      requester: req.user._id,
      status: "pending",
    }).populate({
      path: "recipient",
      select: "username fullName profilePicture",
    });

    res.status(200).json({
      status: "success",
      results: requests.length,
      data: {
        requests,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Error retrieving outgoing friend requests",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const recipientId = req.params.userId;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({
        status: "failed",
        message: "You cannot send a friend request to yourself",
      });
    }

    const existingFriend = await Friend.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id },
      ],
    });

    if (existingFriend) {
      return res.status(400).json({
        status: "failed",
        message: "A friendship or request already exists with this user",
      });
    }

    const newFriend = await Friend.create({
      requester: req.user._id,
      recipient: recipientId,
      status: "pending",
    });

    res.status(201).json({
      status: "success",
      data: {
        friend: newFriend,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Error sending friend request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;

    // Find the friend request
    const friend = await Friend.findOne({
      _id: requestId,
      recipient: req.user._id,
      status: "pending",
    });

    if (!friend) {
      return res.status(404).json({
        status: "failed",
        message: "Friend request not found or already processed",
      });
    }

    // Update status to accepted
    friend.status = "accepted";
    await friend.save();

    res.status(200).json({
      status: "success",
      data: {
        friend,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Error accepting friend request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  try {
    const requestId = req.params.requestId;

    // Find the friend request
    const friend = await Friend.findOne({
      _id: requestId,
      recipient: req.user._id,
      status: "pending",
    });

    if (!friend) {
      return res.status(404).json({
        status: "failed",
        message: "Friend request not found or already processed",
      });
    }

    // Update status to rejected
    friend.status = "rejected";
    await friend.save();

    res.status(200).json({
      status: "success",
      data: {
        friend,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Error rejecting friend request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Remove/unfriend a friend
exports.removeFriend = async (req, res) => {
  try {
    const friendId = req.params.friendId;

    // Find the friend
    const friend = await Friend.findOneAndDelete({
      $or: [
        { requester: req.user._id, recipient: friendId, status: "accepted" },
        { requester: friendId, recipient: req.user._id, status: "accepted" },
      ],
    });

    if (!friend) {
      return res.status(404).json({
        status: "failed",
        message: "Friend not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Friend removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "Error removing friend",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
