import { BrowserRouter } from "react-router-dom";
import "./App.css";
import AuthRoutes from "./routes/AuthRoutes";

function App() {
	return (
		<BrowserRouter>
			<AuthRoutes />
		</BrowserRouter>
	);
}

export default App;
