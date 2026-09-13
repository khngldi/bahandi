import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AppRoute from "./components/AppRoute";

function App() {
    return (
        <Router>
            <a className="skip-link" href="#main-content">Перейти к содержимому</a>
            <Navbar />
            <main id="main-content"><AppRoute /></main>
            <Footer />
        </Router>
    );
}

export default App;
