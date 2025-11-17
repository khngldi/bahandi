import { useEffect, useState } from "react";
import axios from "axios";
import "../components/home.css";
import HomeCard from "../components/HomeCard.jsx";

export default function Home() {
    const [cards, setCards] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchCards() {
            try {
                const res = await axios.get("https://8793bad894280e6b.mokky.dev/homecards");
                setCards(res.data);
            } catch (err) {
                console.error(err);
                setError("Ошибка при загрузке карточек");
            } finally {
                setLoading(false);
            }
        }

        fetchCards();
    }, []);

    if (isLoading) return <p className="loading">Загрузка...</p>;

    if (error)
        return (
            <div className="error-container">
                <img src="/images/error-icon.jpg" alt="Ошибка" className="error-img" />
                <h2 className="error-text">{error}</h2>
                <p className="error-sub">Попробуйте обновить страницу позже.</p>
            </div>
        );

    return (
        <div className="home-page">
            <h1 className="home-title">Добро пожаловать в ресторан KHNGLDI's BAHANDI.</h1>
            <p className="home-text">Выберите понравившиеся вам пункты меню ниже:</p>
            <img src="/images/IMAGE3.webp" alt="Restaurant" className="home-center-img" />

            <div className="home-grid">
                {cards.length > 0 ? (
                    cards.map((card) => <HomeCard key={card.id} card={card} />)
                ) : (
                    <p>Пока нет карточек для отображения.</p>
                )}
            </div>
        </div>
    );
}
