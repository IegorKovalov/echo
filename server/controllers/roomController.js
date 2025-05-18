const Room = require("../models/roomModel");
const RoomMember = require("../models/roomMemberModel");
const RoomMessage = require("../models/roomMessageModel");
const { sendError, sendSuccess } = require("../utils/http/responseUtils");

// Room discovery methods
exports.discoverRooms = async (req, res, next) => {
  try {
    // Implement room discovery logic
    const rooms = await Room.find({ roomType: "user-created", expiresAt: { $gt: new Date() } })
      .sort("-createdAt")
      .limit(20);
      
    return sendSuccess(res, 200, "Rooms discovered successfully", { 
      results: rooms.length, 
      data: { rooms } 
    });
  } catch (err) {
    next(err);
  }
};

exports.getOfficialRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ roomType: "official" });
    
    return sendSuccess(res, 200, "Official rooms retrieved", { 
      results: rooms.length, 
      data: { rooms } 
    });
  } catch (err) {
    next(err);
  }
};

exports.getRoomsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    
    const rooms = await Room.find({ 
      category,
      expiresAt: { $gt: new Date() } 
    }).sort("-participantCount");
    
    return sendSuccess(res, 200, `Rooms for category ${category} retrieved`, { 
      results: rooms.length, 
      data: { rooms } 
    });
  } catch (err) {
    next(err);
  }
};

// Room CRUD operations
exports.createRoom = async (req, res, next) => {
  try {
    // Add creator as room owner
    const roomData = {
      ...req.body,
      roomType: "user-created",
      createdBy: req.user.id
    };
    
    const room = await Room.create(roomData);
    
    // Create room membership for creator with admin role
    await RoomMember.findOrCreate(room.id, req.user.id, true);
    
    return sendSuccess(res, 201, "Room created successfully", { data: { room } });
  } catch (err) {
    next(err);
  }
};

exports.getUserRooms = async (req, res, next) => {
  try {
    // Find rooms where user is a member
    const memberships = await RoomMember.find({ 
      user: req.user.id,
      isActive: true,
      isKicked: false
    });
    
    const roomIds = memberships.map(membership => membership.room);
    
    const rooms = await Room.find({ 
      _id: { $in: roomIds },
      expiresAt: { $gt: new Date() } 
    });
    
    return sendSuccess(res, 200, "User rooms retrieved", { 
      results: rooms.length, 
      data: { rooms } 
    });
  } catch (err) {
    next(err);
  }
};

exports.getRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findById(roomId);
    
    if (!room) {
      return sendError(res, 404, "Room not found");
    }
    
    return sendSuccess(res, 200, "Room retrieved", { data: { room } });
  } catch (err) {
    next(err);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    
    // Verify user is admin of this room
    const membership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id,
      role: "admin"
    });
    
    if (!membership) {
      return sendError(res, 403, "You don't have permission to update this room");
    }
    
    const room = await Room.findByIdAndUpdate(roomId, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!room) {
      return sendError(res, 404, "Room not found");
    }
    
    return sendSuccess(res, 200, "Room updated successfully", { data: { room } });
  } catch (err) {
    next(err);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    
    // Verify user is admin of this room
    const membership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id,
      role: "admin"
    });
    
    if (!membership) {
      return sendError(res, 403, "You don't have permission to delete this room");
    }
    
    const room = await Room.findById(roomId);
    
    if (!room) {
      return sendError(res, 404, "Room not found");
    }
    
    if (room.roomType === "official") {
      return sendError(res, 403, "Official rooms cannot be deleted");
    }
    
    // Mark room for deletion by setting expiration to 1 hour from now
    await room.markForDeletion();
    
    return sendSuccess(res, 204, "Room marked for deletion");
  } catch (err) {
    next(err);
  }
};

// Room interaction routes
exports.joinRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    
    const room = await Room.findById(roomId);
    
    if (!room) {
      return sendError(res, 404, "Room not found");
    }
    
    if (room.isFull) {
      return sendError(res, 400, "This room is full");
    }
    
    // Check if room needs reset
    if (room.needsReset) {
      await room.reset();
    }
    
    const roomMember = await RoomMember.findOrCreate(roomId, req.user.id);
    
    if (!roomMember) {
      return sendError(res, 403, "You have been kicked from this room");
    }
    
    // Update room participant count
    room.participantCount += 1;
    await room.save();
    
    return sendSuccess(res, 200, "Room joined successfully", { data: { roomMember } });
  } catch (err) {
    next(err);
  }
};

exports.leaveRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    
    const roomMember = await RoomMember.findOne({
      room: roomId,
      user: req.user.id
    });
    
    if (!roomMember) {
      return sendError(res, 404, "You are not a member of this room");
    }
    
    // Mark as inactive
    roomMember.isActive = false;
    await roomMember.save();
    
    // Update room participant count
    const room = await Room.findById(roomId);
    if (room) {
      room.participantCount = Math.max(0, room.participantCount - 1);
      await room.save();
    }
    
    return sendSuccess(res, 204, "Room left successfully");
  } catch (err) {
    next(err);
  }
};

exports.getRoomMembers = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    
    // Verify user is a member of this room
    const userMembership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id
    });
    
    if (!userMembership) {
      return sendError(res, 403, "You are not a member of this room");
    }
    
    const members = await RoomMember.find({ room: roomId })
      .select("anonymousId nickname role isMuted isOnline lastActiveAt");
    
    return sendSuccess(res, 200, "Room members retrieved", { 
      results: members.length, 
      data: { members } 
    });
  } catch (err) {
    next(err);
  }
};

// Admin-only routes
exports.extendRoomExpiration = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    
    // Verify user is admin of this room
    const membership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id,
      role: "admin"
    });
    
    if (!membership) {
      return sendError(res, 403, "You don't have permission to extend this room");
    }
    
    const room = await Room.findById(roomId);
    
    if (!room) {
      return sendError(res, 404, "Room not found");
    }
    
    await room.extendExpiration();
    
    return sendSuccess(res, 200, "Room expiration extended", { data: { room } });
  } catch (err) {
    next(err);
  }
};

exports.muteRoomMember = async (req, res, next) => {
  try {
    const { roomId, memberId } = req.params;
    const { duration } = req.body;
    
    // Verify user is admin of this room
    const adminMembership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id,
      role: "admin"
    });
    
    if (!adminMembership) {
      return sendError(res, 403, "You don't have permission to mute members");
    }
    
    const memberToMute = await RoomMember.findById(memberId);
    
    if (!memberToMute || memberToMute.room.toString() !== roomId) {
      return sendError(res, 404, "Member not found in this room");
    }
    
    await memberToMute.mute(duration, adminMembership.id);
    
    return sendSuccess(res, 200, "Member muted successfully", { 
      data: { member: memberToMute } 
    });
  } catch (err) {
    next(err);
  }
};

exports.unmuteRoomMember = async (req, res, next) => {
  try {
    const { roomId, memberId } = req.params;
    
    // Verify user is admin of this room
    const adminMembership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id,
      role: "admin"
    });
    
    if (!adminMembership) {
      return sendError(res, 403, "You don't have permission to unmute members");
    }
    
    const memberToUnmute = await RoomMember.findById(memberId);
    
    if (!memberToUnmute || memberToUnmute.room.toString() !== roomId) {
      return sendError(res, 404, "Member not found in this room");
    }
    
    await memberToUnmute.unmute();
    
    return sendSuccess(res, 200, "Member unmuted successfully", { 
      data: { member: memberToUnmute } 
    });
  } catch (err) {
    next(err);
  }
};

exports.kickRoomMember = async (req, res, next) => {
  try {
    const { roomId, memberId } = req.params;
    
    // Verify user is admin of this room
    const adminMembership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id,
      role: "admin"
    });
    
    if (!adminMembership) {
      return sendError(res, 403, "You don't have permission to kick members");
    }
    
    const memberToKick = await RoomMember.findById(memberId);
    
    if (!memberToKick || memberToKick.room.toString() !== roomId) {
      return sendError(res, 404, "Member not found in this room");
    }
    
    // Prevent kicking another admin
    if (memberToKick.role === "admin") {
      return sendError(res, 403, "Cannot kick an admin");
    }
    
    await memberToKick.kick(adminMembership.id);
    
    // Update room participant count
    const room = await Room.findById(roomId);
    if (room) {
      room.participantCount = Math.max(0, room.participantCount - 1);
      await room.save();
    }
    
    return sendSuccess(res, 204, "Member kicked successfully");
  } catch (err) {
    next(err);
  }
};

// Message routes
exports.getRoomMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Verify user is a member of this room
    const userMembership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id
    });
    
    if (!userMembership) {
      return sendError(res, 403, "You are not a member of this room");
    }
    
    // Update user's last active time
    userMembership.updateActivity();
    
    const skip = (page - 1) * limit;
    
    const messages = await RoomMessage.find({ room: roomId })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)
      .populate({
        path: "roomMember",
        select: "anonymousId nickname role"
      });
    
    return sendSuccess(res, 200, "Room messages retrieved", { 
      results: messages.length, 
      data: { messages } 
    });
  } catch (err) {
    next(err);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { content, format = "plain", replyTo } = req.body;
    
    // Find the user's membership in this room
    const roomMember = await RoomMember.findOne({
      room: roomId,
      user: req.user.id
    });
    
    if (!roomMember) {
      return sendError(res, 403, "You are not a member of this room");
    }
    
    // Check if user is muted
    if (!roomMember.canSpeak) {
      return sendError(res, 403, "You are currently muted in this room");
    }
    
    // Update user's last active time
    roomMember.updateActivity();
    
    // Create the message
    const messageData = {
      room: roomId,
      roomMember: roomMember.id,
      content,
      format
    };
    
    // Add reply reference if provided
    if (replyTo) {
      const replyMessage = await RoomMessage.findById(replyTo);
      if (!replyMessage || replyMessage.room.toString() !== roomId) {
        return sendError(res, 404, "Reply message not found in this room");
      }
      messageData.replyTo = replyTo;
    }
    
    const message = await RoomMessage.create(messageData);
    
    return sendSuccess(res, 201, "Message created successfully", { data: { message } });
  } catch (err) {
    next(err);
  }
};

// Admin deletion of messages
exports.adminDeleteMessage = async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params;
    
    // Verify user is admin of this room
    const adminMembership = await RoomMember.findOne({
      room: roomId,
      user: req.user.id,
      role: "admin"
    });
    
    if (!adminMembership) {
      return sendError(res, 403, "You don't have permission to delete messages");
    }
    
    const message = await RoomMessage.findById(messageId);
    
    if (!message || message.room.toString() !== roomId) {
      return sendError(res, 404, "Message not found in this room");
    }
    
    await message.adminDelete(adminMembership.id);
    
    return sendSuccess(res, 204, "Message deleted successfully");
  } catch (err) {
    next(err);
  }
};

// Message interaction routes
exports.reactToMessage = async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params;
    const { emoji } = req.body;
    
    // Verify user is a member of this room
    const roomMember = await RoomMember.findOne({
      room: roomId,
      user: req.user.id
    });
    
    if (!roomMember) {
      return sendError(res, 403, "You are not a member of this room");
    }
    
    const message = await RoomMessage.findById(messageId);
    
    if (!message || message.room.toString() !== roomId) {
      return sendError(res, 404, "Message not found in this room");
    }
    
    await message.addReaction(roomMember.id, emoji);
    
    return sendSuccess(res, 200, "Reaction added successfully", { data: { message } });
  } catch (err) {
    next(err);
  }
};

exports.removeReaction = async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params;
    const { emoji } = req.body;
    
    // Verify user is a member of this room
    const roomMember = await RoomMember.findOne({
      room: roomId,
      user: req.user.id
    });
    
    if (!roomMember) {
      return sendError(res, 403, "You are not a member of this room");
    }
    
    const message = await RoomMessage.findById(messageId);
    
    if (!message || message.room.toString() !== roomId) {
      return sendError(res, 404, "Message not found in this room");
    }
    
    await message.removeReaction(roomMember.id, emoji);
    
    return sendSuccess(res, 200, "Reaction removed successfully", { data: { message } });
  } catch (err) {
    next(err);
  }
};

exports.replyToMessage = async (req, res, next) => {
  try {
    const { roomId, messageId } = req.params;
    const { content, format = "plain" } = req.body;
    
    // Find the user's membership in this room
    const roomMember = await RoomMember.findOne({
      room: roomId,
      user: req.user.id
    });
    
    if (!roomMember) {
      return sendError(res, 403, "You are not a member of this room");
    }
    
    // Check if user is muted
    if (!roomMember.canSpeak) {
      return sendError(res, 403, "You are currently muted in this room");
    }
    
    // Check if the message to reply to exists in this room
    const replyToMessage = await RoomMessage.findById(messageId);
    
    if (!replyToMessage || replyToMessage.room.toString() !== roomId) {
      return sendError(res, 404, "Message not found in this room");
    }
    
    // Create the reply message
    const message = await RoomMessage.create({
      room: roomId,
      roomMember: roomMember.id,
      content,
      format,
      replyTo: messageId
    });
    
    return sendSuccess(res, 201, "Reply created successfully", { data: { message } });
  } catch (err) {
    next(err);
  }
};