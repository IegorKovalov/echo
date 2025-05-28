import { AuthProvider } from "./AuthContext";
import { FollowerProvider } from "./FollowerContext";
import { PostProvider } from "./PostContext";
import { ToastProvider } from "./ToastContext";
import { ViewTrackingProvider } from "./ViewTrackingContext";

export const AppProviders = ({ children }) => {
	return (
		<ToastProvider>
			<AuthProvider>
				<ViewTrackingProvider>
					<FollowerProvider>
						<PostProvider>{children}</PostProvider>
					</FollowerProvider>
				</ViewTrackingProvider>
			</AuthProvider>
		</ToastProvider>
	);
};
