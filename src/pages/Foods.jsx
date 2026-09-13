import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import '../components/array.css';
import axios from "axios";
import LoadingFoods from '../components/LoadingFoods.jsx';
import FoodsCard from "../components/FoodsCard.jsx";

export default function Foods() {

    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const typeFilter = params.get("type");
    const searchFilter = params.get("search");

    const [cart, setCart] = useState([]);
    const [foods, setFoods] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchFoods() {
            try {
                const response = await axios.get('https://8793bad894280e6b.mokky.dev/foods');

                let data = response.data;

                //Фильтр drink / chicken
                if (typeFilter) {
                    data = data.filter(item => item.type === typeFilter);
                }

                setFoods(data);
                setError(null);

            } catch (err) {
                console.error(err);
                setError("Ошибка загрузки продуктов");
            } finally {
                setLoading(false);
            }
        }

        setLoading(true);
        fetchFoods();

    }, [typeFilter]);

    const processedFoods = useMemo(() => {
        let f = [...foods];

        if (searchFilter) {
            const text = searchFilter.toLowerCase();
            f = f.filter(item =>
                item.name.toLowerCase().includes(text) ||
                item.type.toLowerCase().includes(text)
            );
        }

        return f;

    }, [foods, searchFilter]);

    const AddToCart = (product) => {
        setCart(prev => {
            const exist = prev.find(item => item.id === product.id);

            if (exist) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, { ...product, quantity: 1 }];
        });
    };

    if (error) {
        return (
            <div className="error-container">
                <img src="/images/error-icon.jpg" alt="Ошибка" className="error-img" />
                <h2 className="error-text">{error}</h2>
                <p className="error-sub">Попробуйте позже.</p>
            </div>
        );
    }

    return (
        <div className="drinks-page container">
            <div className="menu-heading"><div>
                <p className="eyebrow">BAHANDI / Меню</p>
                <h1 className="title">
                    {typeFilter === "drink" && "Напитки"}
                    {typeFilter === "chicken" && "Бургеры с курицей"}
                    {!typeFilter && "Наше меню"}
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
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => <LoadingFoods key={i} />)
                ) : (
                    processedFoods.length === 0 ? <div className="empty-state"><h2>Блюда не найдены</h2><p>{searchFilter ? "Попробуйте изменить поисковый запрос." : "В этой категории пока нет блюд."}</p><Link className="text-link" to="/foods">Показать всё меню →</Link></div> : processedFoods.map(food => (
                        <FoodsCard
                            key={food.id}
                            product={food}
                            onAddToCart={AddToCart}
                        />
                    ))
                )}
            </div>
            <aside className="cart-panel" id="cart" tabIndex="-1" aria-labelledby="cart-title">
                <h2 id="cart-title">Ваша корзина</h2>
                <p className="cart-count" role="status">Блюд в корзине: {cart.reduce((s, i) => s + i.quantity, 0)}</p>
                {cart.length ? <ul className="cart-items">{cart.map(item => <li key={item.id}><span>{item.name}<br /><small>{item.quantity} шт.</small></span><b>{item.price * item.quantity} ₸</b></li>)}</ul> : <p className="cart-note">Добавьте что-нибудь из меню.</p>}
                <p className="cart-total"><span>Общая сумма</span><strong>{cart.reduce((t, i) => t + i.price * i.quantity, 0)} ₸</strong></p>
            </aside>
            </div>
        </div>
    );
}
