const Room = require("../models/roomModel");
const RoomMember = require("../models/roomMemberModel");
const RoomMessage = require("../models/roomMessageModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Room discovery methods
exports.discoverRooms = catchAsync(async (req, res, next) => {
  // Implement room discovery logic
  const rooms = await Room.find({ roomType: "user-created", expiresAt: { $gt: new Date() } })
    .sort("-createdAt")
    .limit(20);
    
  res.status(200).json({
    status: "success",
    results: rooms.length,
    data: { rooms }
  });
});

exports.getOfficialRooms = catchAsync(async (req, res, next) => {
  const rooms = await Room.find({ roomType: "official" });
  
  res.status(200).json({
    status: "success",
    results: rooms.length,
    data: { rooms }
  });
});

exports.getRoomsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  
  const rooms = await Room.find({ 
    category,
    expiresAt: { $gt: new Date() } 
  }).sort("-participantCount");
  
  res.status(200).json({
    status: "success",
    results: rooms.length,
    data: { rooms }
  });
});

// Room CRUD operations
exports.createRoom = catchAsync(async (req, res, next) => {
  // Add creator as room owner
  const roomData = {
    ...req.body,
    roomType: "user-created",
    createdBy: req.user.id
  };
  
  const room = await Room.create(roomData);
  
  // Create room membership for creator with admin role
  await RoomMember.findOrCreate(room.id, req.user.id, true);
  
  res.status(201).json({
    status: "success",
    data: { room }
  });
});

exports.getUserRooms = catchAsync(async (req, res, next) => {
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
  
  res.status(200).json({
    status: "success",
    results: rooms.length,
    data: { rooms }
  });
});

exports.getRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  
  const room = await Room.findById(roomId);
  
  if (!room) {
    return next(new AppError("Room not found", 404));
  }
  
  res.status(200).json({
    status: "success",
    data: { room }
  });
});

exports.updateRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  
  // Verify user is admin of this room
  const membership = await RoomMember.findOne({
    room: roomId,
    user: req.user.id,
    role: "admin"
  });
  
  if (!membership) {
    return next(new AppError("You don't have permission to update this room", 403));
  }
  
  const room = await Room.findByIdAndUpdate(roomId, req.body, {
    new: true,
    runValidators: true
  });
  
  if (!room) {
    return next(new AppError("Room not found", 404));
  }
  
  res.status(200).json({
    status: "success",
    data: { room }
  });
});

exports.deleteRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  
  // Verify user is admin of this room
  const membership = await RoomMember.findOne({
    room: roomId,
    user: req.user.id,
    role: "admin"
  });
  
  if (!membership) {
    return next(new AppError("You don't have permission to delete this room", 403));
  }
  
  const room = await Room.findById(roomId);
  
  if (!room) {
    return next(new AppError("Room not found", 404));
  }
  
  if (room.roomType === "official") {
    return next(new AppError("Official rooms cannot be deleted", 403));
  }
  
  // Mark room for deletion by setting expiration to 1 hour from now
  await room.markForDeletion();
  
  res.status(204).json({
    status: "success",
    data: null
  });
});

// Room interaction routes
exports.joinRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  
  const room = await Room.findById(roomId);
  
  if (!room) {
    return next(new AppError("Room not found", 404));
  }
  
  if (room.isFull) {
    return next(new AppError("This room is full", 400));
  }
  
  // Check if room needs reset
  if (room.needsReset) {
    await room.reset();
  }
  
  const roomMember = await RoomMember.findOrCreate(roomId, req.user.id);
  
  if (!roomMember) {
    return next(new AppError("You have been kicked from this room", 403));
  }
  
  // Update room participant count
  room.participantCount += 1;
  await room.save();
  
  res.status(200).json({
    status: "success",
    data: { roomMember }
  });
});

exports.leaveRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  
  const roomMember = await RoomMember.findOne({
    room: roomId,
    user: req.user.id
  });
  
  if (!roomMember) {
    return next(new AppError("You are not a member of this room", 404));
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
  
  res.status(204).json({
    status: "success",
    data: null
  });
});

exports.getRoomMembers = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  
  // Verify user is a member of this room
  const userMembership = await RoomMember.findOne({
    room: roomId,
    user: req.user.id
  });
  
  if (!userMembership) {
    return next(new AppError("You are not a member of this room", 403));
  }
  
  const members = await RoomMember.find({ room: roomId })
    .select("anonymousId nickname role isMuted isOnline lastActiveAt");
  
  res.status(200).json({
    status: "success",
    results: members.length,
    data: { members }
  });
});

// Admin-only routes
exports.extendRoomExpiration = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  
  // Verify user is admin of this room
  const membership = await RoomMember.findOne({
    room: roomId,
    user: req.user.id,
    role: "admin"
  });
  
  if (!membership) {
    return next(new AppError("You don't have permission to extend this room", 403));
  }
  
  const room = await Room.findById(roomId);
  
  if (!room) {
    return next(new AppError("Room not found", 404));
  }
  
  await room.extendExpiration();
  
  res.status(200).json({
    status: "success",
    data: { room }
  });
});

exports.muteRoomMember = catchAsync(async (req, res, next) => {
  const { roomId, memberId } = req.params;
  const { duration } = req.body;
  
  // Verify user is admin of this room
  const adminMembership = await RoomMember.findOne({
    room: roomId,
    user: req.user.id,
    role: "admin"
  });
  
  if (!adminMembership) {
    return next(new AppError("You don't have permission to mute members", 403));
  }
  
  const memberToMute = await RoomMember.findById(memberId);
  
  if (!memberToMute || memberToMute.room.toString() !== roomId) {
    return next(new AppError("Member not found in this room", 404));
  }
  
  await memberToMute.mute(duration, adminMembership.id);
  
  res.status(200).json({
    status: "success",
    data: { member: memberToMute }
  });
});

exports.unmuteRoomMember = catchAsync(async (req, res, next) => {
  const { roomId, memberId } = req.params;
  
  // Verify user is admin of this room
  const adminMembership = await RoomMember.findOne({
    room: roomId,
    user: req.user.id,
    role: "admin"
  });
  
  if (!adminMembership) {
    return next(new AppError("You don't have permission to unmute members", 403));
  }
  
  const memberToUnmute = await RoomMember.findById(memberId);
  
  if (!memberToUnmute || memberToUnmute.room.toString() !== roomId) {
    return next(new AppError("Member not found in this room", 404));
  }
  
  await memberToUnmute.unmute();
  
  res.status(200).json({
    status: "success",
    data: { member: memberToUnmute }
  });
});

exports.kickRoomMember = catchAsync(async (req, res, next) => {
  const { roomId, memberId } = req.params;
  
  // Verify user is admin of this room
  const adminMembership = await RoomMember.findOne({
    room: roomId,
    user: req.user.id,
    role: "admin"
  });
  
  if (!adminMembership) {
    return next(new AppError("You don't have permission to kick members", 403));
  }
  
  const memberToKick = await RoomMember.findById(memberId);
  
  if (!memberToKick || memberToKick.room.toString() !== roomId) {
    return next(new AppError("Member not found in this room", 404));
  }
  
  // Prevent kicking another admin
  if (memberToKick.role === "admin") {
    return next(new AppError("Cannot kick an admin", 403));
  }
  
  await memberToKick.kick(adminMembership.id);
  
  // Update room participant count
  const room = await Room.findById(roomId);
  if (room) {
    room.participantCount = Math.max(0, room.participantCount - 1);
    await room.save();
  }
  
  res.status(204).json({
    status: "success",
    data: null
  });
});

// Message routes
exports.getRoomMessages = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  // Verify user is a member of this room
  const userMembership = await RoomMember.findOne({
    room: roomId,
    user: req.user.id
  });
  
  if (!userMembership) {
    return next(new AppError("You are not a member of this room", 403));
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
  
  res.status(200).json({
    status: "success",
    results: messages.length,
    data: { messages }
  });
});

exports.createMessage = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  const { content, format = "plain", replyTo } = req.body;
  
  // Find the user's membership in this room
  const roomMember = await RoomMember.findOne({
    room: roomId,
    user: req.user.id
  });
  
  if (!roomMember) {
    return next(new AppError("You are not a member of this room", 403));
  }
  
  // Check if user is muted
  if (!roomMember.canSpeak) {
    return next(new AppError("You are currently muted in this room", 403));
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
      return next(new AppError("Reply message not found in this room", 404));
    }
    messageData.replyTo = replyTo;
  }
  
  const message = await RoomMessage.create(messageData);
  
  res.status(201).json({
    status: "success",
    data: { message }
  });
});

// Admin deletion of messages
exports.adminDeleteMessage = catchAsync(async (req, res, next) => {
  const { roomId, messageId } = req.params;
  
  // Verify user is admin of this room
  const adminMembership = await RoomMember.findOne({
    room: roomId,
    user: req.user.id,
    role: "admin"
  });
  
  if (!adminMembership) {
    return next(new AppError("You don't have permission to delete messages", 403));
  }
  
  const message = await RoomMessage.findById(messageId);
  
  if (!message || message.room.toString() !== roomId) {
    return next(new AppError("Message not found in this room", 404));
  }
  
  await message.adminDelete(adminMembership.id);
  
  res.status(204).json({
    status: "success",
    data: null
  });
});

// Message interaction routes
exports.reactToMessage = catchAsync(async (req, res, next) => {
  const { roomId, messageId } = req.params;
  const { emoji } = req.body;
  
  // Verify user is a member of this room
  const roomMember = await RoomMember.findOne({
    room: roomId,
    user: req.user.id
  });
  
  if (!roomMember) {
    return next(new AppError("You are not a member of this room", 403));
  }
  
  const message = await RoomMessage.findById(messageId);
  
  if (!message || message.room.toString() !== roomId) {
    return next(new AppError("Message not found in this room", 404));
  }
  
  await message.addReaction(roomMember.id, emoji);
  
  res.status(200).json({
    status: "success",
    data: { message }
  });
});

exports.removeReaction = catchAsync(async (req, res, next) => {
  const { roomId, messageId } = req.params;
  const { emoji } = req.body;
  
  // Verify user is a member of this room
  const roomMember = await RoomMember.findOne({
    room: roomId,
    user: req.user.id
  });
  
  if (!roomMember) {
    return next(new AppError("You are not a member of this room", 403));
  }
  
  const message = await RoomMessage.findById(messageId);
  
  if (!message || message.room.toString() !== roomId) {
    return next(new AppError("Message not found in this room", 404));
  }
  
  await message.removeReaction(roomMember.id, emoji);
  
  res.status(200).json({
    status: "success",
    data: { message }
  });
});

exports.replyToMessage = catchAsync(async (req, res, next) => {
  const { roomId, messageId } = req.params;
  const { content, format = "plain" } = req.body;
  
  // Find the user's membership in this room
  const roomMember = await RoomMember.findOne({
    room: roomId,
    user: req.user.id
  });
  
  if (!roomMember) {
    return next(new AppError("You are not a member of this room", 403));
  }
  
  // Check if user is muted
  if (!roomMember.canSpeak) {
    return next(new AppError("You are currently muted in this room", 403));
  }
  
  // Check if the message to reply to exists in this room
  const replyToMessage = await RoomMessage.findById(messageId);
  
  if (!replyToMessage || replyToMessage.room.toString() !== roomId) {
    return next(new AppError("Message not found in this room", 404));
  }
  
  // Create the reply message
  const message = await RoomMessage.create({
    room: roomId,
    roomMember: roomMember.id,
    content,
    format,
    replyTo: messageId
  });
  
  res.status(201).json({
    status: "success",
    data: { message }
  });
});
