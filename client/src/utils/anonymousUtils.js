import { anonymousColors } from "../data/roomsData";

export const getAnonymousColor = (anonymousId) => {
	const hash = anonymousId.split("").reduce((a, b) => {
		a = (a << 5) - a + b.charCodeAt(0);
		return a & a;
	}, 0);
	return anonymousColors[Math.abs(hash) % anonymousColors.length];
};

export const generateAnonymousId = () => {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "user_";
	for (let i = 0; i < 4; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
};

export const isRoomFull = (room) => {
	if (!room) return false;
	return room.maxParticipants && room.participantCount >= room.maxParticipants;
};

export const isRoomNearCapacity = (room) => {
	if (!room) return false;
	return room.maxParticipants && room.participantCount / room.maxParticipants > 0.8;
}; 