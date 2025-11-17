import { useEffect, useMemo, useState } from 'react';
import { useLocation } from "react-router-dom";
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
        <div className="drinks-page">

            <h2>Корзина: {cart.reduce((s, i) => s + i.quantity, 0)} шт</h2>
            <p>Общая сумма: {cart.reduce((t, i) => t + i.price * i.quantity, 0)} ₸</p>

            <h1 className="title">
                {typeFilter === "drink" && "Напитки"}
                {typeFilter === "chicken" && "Курица"}
                {!typeFilter && "Все продукты"}
            </h1>

            <div className="drinks-grid">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => <LoadingFoods key={i} />)
                ) : (
                    processedFoods.map(food => (
                        <FoodsCard
                            key={food.id}
                            product={food}
                            onAddToCart={AddToCart}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
