import { useParams } from "react-router-dom";
import ProfileLayout from "../components/profile/ProfileLayout";

export default function ProfilePage() {
	const { userId } = useParams();
	return <ProfileLayout userId={userId} posts={posts} />;
}
