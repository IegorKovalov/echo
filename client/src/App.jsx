import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import AuthRoutes from "./routes/AuthRoutes";

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<AuthRoutes />
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
