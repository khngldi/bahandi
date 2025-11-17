import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoute from "./components/AppRoute";

function App() {
    return (
        <Router>
            <Navbar />
            <AppRoute />
            <Footer />
        </Router>
    );
}

export default App;
