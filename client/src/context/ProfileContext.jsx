import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
	const { currentUser } = useAuth();
	const [profileImage, setProfileImage] = useState(
		currentUser?.profilePicture || null
	);
	useEffect(() => {
		if (currentUser?.profilePicture) {
			setProfileImage(currentUser.profilePicture);
		}
	}, [currentUser]);

	const updateProfileImage = (newImageUrl) => {
		setProfileImage(newImageUrl);
	};

	return (
		<ProfileContext.Provider value={{ profileImage, updateProfileImage }}>
			{children}
		</ProfileContext.Provider>
	);
}

export function useProfile() {
	return useContext(ProfileContext);
}
