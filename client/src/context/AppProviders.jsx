import { AuthProvider } from "./AuthContext";
import { FollowerProvider } from "./FollowerContext";
import { PostProvider } from "./PostContext";
import { RoomProvider } from "./RoomContext";
import { ToastProvider } from "./ToastContext";
import { ViewTrackingProvider } from "./ViewTrackingContext";

export const AppProviders = ({ children }) => {
	return (
		<ToastProvider>
			<AuthProvider>
				<ViewTrackingProvider>
					<FollowerProvider>
						<PostProvider>
							<RoomProvider>{children}</RoomProvider>
						</PostProvider>
					</FollowerProvider>
				</ViewTrackingProvider>
			</AuthProvider>
		</ToastProvider>
	);
};
