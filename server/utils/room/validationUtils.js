exports.validateRoomCreation = (roomData) => {
  const { name, description, duration, maxUsers } = roomData;
  
  if (!name || name.trim() === "") {
    return {
      isValid: false,
      message: "Room name is required"
    };
  }
  
  if (name.length > 100) {
    return {
      isValid: false,
      message: "Room name cannot exceed 100 characters"
    };
  }
  
  if (description && description.length > 500) {
    return {
      isValid: false,
      message: "Room description cannot exceed 500 characters"
    };
  }
  
  if (duration) {
    const durationHours = parseInt(duration);
    if (isNaN(durationHours) || durationHours < 1 || durationHours > 168) {
      return {
        isValid: false,
        message: "Duration must be between 1 and 168 hours"
      };
    }
  }
  
  if (maxUsers) {
    const maxUsersCount = parseInt(maxUsers);
    if (isNaN(maxUsersCount) || maxUsersCount < 5 || maxUsersCount > 500) {
      return {
        isValid: false,
        message: "Room capacity must be between 5 and 500 users"
      };
    }
  }
  
  return { isValid: true };
};

exports.validateMessageCreation = (messageData) => {
  const { content } = messageData;
  
  if (!content || content.trim() === "") {
    return {
      isValid: false,
      message: "Message content is required"
    };
  }
  
  if (content.length > 2000) {
    return {
      isValid: false,
      message: "Message cannot exceed 2000 characters"
    };
  }
  
  return { isValid: true };
};