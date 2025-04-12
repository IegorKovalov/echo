export const getInitials = (name) => {
	if (!name) return "?";
	const parts = name.split(" ");
	if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getInitialsBackgroundColor = (name) => {
	if (!name) return "#757575";
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	const h = Math.abs(hash % 360);
	const s = 65 + (hash % 25);
	const l = 45 + (hash % 10);

	return `hsl(${h}, ${s}%, ${l}%)`;
};
