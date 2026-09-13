import { Link, useSearchParams, useLocation } from "react-router-dom";
import "./navbar.css";
import { useState } from "react";

export default function Navbar() {

    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
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

    const type = searchParams.get("type");
    const navClass = (active) => `navbar-link${active ? " active" : ""}`;
    return (
        <header className="navbar">
            <nav className="navbar-inner container" aria-label="Основная навигация" onKeyDown={(e) => { if (e.key === "Escape") setMenuOpen(false); }}>
                <div className="navbar-logo">
                    <Link to="/" className="navbar-home-link" onClick={() => setMenuOpen(false)}>BAHANDI</Link>
                </div>
                <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="navbar-menu" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? "Закрыть" : "Меню"}
                </button>
                <div id="navbar-menu" className={`navbar-menu${menuOpen ? " is-open" : ""}`}>
                    <ul className="navbar-links" onClick={() => setMenuOpen(false)}>
                        <li><Link to="/" className={navClass(location.pathname === "/")} aria-current={location.pathname === "/" ? "page" : undefined}>Главная</Link></li>
                        <li><Link to="/foods?type=chicken" className={navClass(isFoodsPage && type === "chicken")} aria-current={isFoodsPage && type === "chicken" ? "page" : undefined}>Бургеры</Link></li>
                        <li><Link to="/foods?type=drink" className={navClass(isFoodsPage && type === "drink")} aria-current={isFoodsPage && type === "drink" ? "page" : undefined}>Напитки</Link></li>
                    </ul>
                    {isFoodsPage && (
                        <form onSubmit={handleSearch} className="navbar-search" role="search">
                            <label className="sr-only" htmlFor="menu-search">Поиск по меню</label>
                            <input id="menu-search" type="search" placeholder="Найти в меню…" value={searchFoods} onChange={(e) => setSearchFoods(e.target.value)} />
                            <button type="submit">Найти</button>
                        </form>
                    )}
                </div>
                {location.pathname === "/foods" ? (
                    <a className="cart-btn button button-orange" href="#cart" onClick={() => setMenuOpen(false)}>Корзина ↗</a>
                ) : (
                    <Link className="cart-btn button button-orange" to="/foods#cart" onClick={() => setMenuOpen(false)}>Корзина ↗</Link>
                )}
            </nav>
        </header>
    );
}
