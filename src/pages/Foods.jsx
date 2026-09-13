import { useApiResource } from "../hooks/useApiResource.js";
import { searchFoods } from "../utils/validation.js";
import CartPanel from "../components/CartPanel.jsx";
import ApiError from "../components/ApiError.jsx";
import { Link, useLocation } from "react-router-dom";
import '../components/array.css';
import LoadingFoods from '../components/LoadingFoods.jsx';
import FoodsCard from "../components/FoodsCard.jsx";

export default function Foods() {

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const typeFilter = params.get("type");
    const searchFilter = params.get("search");

    const { data, isLoading, error, retry } = useApiResource("/foods");
    const processedFoods = searchFoods(data || [], searchFilter, typeFilter);

    return (
        <div className="drinks-page container">
            <div className="menu-heading"><div>
                <p className="eyebrow">BAHANDI / Меню</p>
                <h1 className="title">
                    {typeFilter === "drink" && "Напитки"}
                    {typeFilter === "chicken" && "Бургеры с курицей"}
                    {!["drink", "chicken"].includes(typeFilter) && "Наше меню"}
                </h1>
                <p>Выберите блюдо — добавьте к нему любимый напиток.</p>
            </div></div>
            <nav className="menu-tabs" aria-label="Категории меню">
                {[{ label: "Всё меню", type: null }, { label: "Бургеры", type: "chicken" }, { label: "Напитки", type: "drink" }].map(item => {
                    const next = new URLSearchParams(location.search);
                    if (item.type) next.set("type", item.type); else next.delete("type");
                    return <Link key={item.label} to={`/foods?${next}`} className={`menu-tab${typeFilter === item.type ? " active" : ""}`} aria-current={typeFilter === item.type ? "page" : undefined}>{item.label}</Link>;
                })}
            </nav>
            <div className="menu-layout">
            <div className="drinks-grid" aria-busy={isLoading}>
                {isLoading && <span className="sr-only" role="status">Загрузка блюд</span>}
                {error ? <ApiError message={error} onRetry={retry} /> : isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => <LoadingFoods key={i} />)
                ) : (
                    processedFoods.length === 0 ? <div className="empty-state"><h2>Блюда не найдены</h2><p>{searchFilter ? "Попробуйте изменить поисковый запрос." : "В этой категории пока нет блюд."}</p><Link className="text-link" to="/foods">Показать всё меню →</Link></div> : processedFoods.map((food, index) => (
                        <FoodsCard
                            key={food.id ?? `missing-${index}`}
                            product={food}
                        />
                    ))
                )}
            </div>
            <CartPanel />
            </div>
        </div>
    );
}
