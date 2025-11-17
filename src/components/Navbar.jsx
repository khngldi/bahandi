import { Link, useSearchParams, useLocation } from "react-router-dom";
import "./navbar.css";
import { useState } from "react";

export default function Navbar() {

    const location = useLocation();
    const isFoodsPage = location.pathname.startsWith("/foods");

    const [searchParams, setSearchParams] = useSearchParams();
    const SearchQuery = searchParams.get("search") || "";

    const [searchFoods, setSearchFoods] = useState(SearchQuery);

    const handleSearch = (e) => {
        e.preventDefault();

        const newParams = new URLSearchParams(searchParams);

        if (searchFoods.trim()) {
            newParams.set("search", searchFoods.trim());
        } else {
            newParams.delete("search");
        }

        setSearchParams(newParams, { replace: true });
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/" className="navbar-home-link">BAHANDI</Link>
            </div>

            {isFoodsPage && (
                <form onSubmit={handleSearch} className="navbar-search">
                    <input
                        type="text"
                        placeholder="Введите нужную еду..."
                        value={searchFoods}
                        onChange={(e) => setSearchFoods(e.target.value)}
                    />
                    <button type="submit">Найти</button>
                </form>
            )}


            <ul className="navbar-links">
                <li><Link to="/foods?type=chicken" className="navbar-link">Чикенс</Link></li>
                <li><Link to="/foods?type=drink" className="navbar-link">Дринкс</Link></li>
                <li><button className="cart-btn">Корзина</button></li>
            </ul>
        </nav>
    );
}
