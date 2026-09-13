import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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


    if (error)
        return (
            <div className="error-container">
                <img src="/images/error-icon.jpg" alt="Ошибка" className="error-img" />
                <h2 className="error-text">{error}</h2>
                <p className="error-sub">Попробуйте обновить страницу позже.</p>
            </div>
        );

    return (
        <div className="home-page container">
            <section className="hero" aria-labelledby="hero-title">
                <div className="hero-copy">
                    <p className="eyebrow">Ресторан BAHANDI</p>
                    <h1 id="hero-title" className="home-title">Твой перерыв.<br />Твой BAHANDI.</h1>
                    <p className="home-text">Бургеры с курицей и любимые напитки. Выберите то, чего хочется прямо сейчас.</p>
                    <Link className="button button-orange" to="/foods">Выбрать в меню <span aria-hidden="true">↗</span></Link>
                    <span className="hero-caption">Бургеры · Напитки · BAHANDI</span>
                </div>
                <div className="hero-image">
                    <img src="/images/Chicken-Sandwich.png" alt="Бургер с курицей BAHANDI" className="home-center-img" fetchPriority="high" />
                </div>
            </section>
            <section className="benefits" aria-label="Выбирать удобно">
                <div className="benefit"><span className="benefit-number">01</span><div><h2>Всё меню под рукой</h2><p>Бургеры и напитки в одном месте.</p></div></div>
                <div className="benefit"><span className="benefit-number">02</span><div><h2>Понятный выбор</h2><p>Фотографии и цены в карточках блюд.</p></div></div>
                <div className="benefit"><span className="benefit-number">03</span><div><h2>Ваше мнение важно</h2><p>Делитесь впечатлениями в комментариях.</p></div></div>
            </section>
            <section aria-labelledby="home-menu-title">
                <div className="section-heading"><div><p className="eyebrow">Что выберете сегодня?</p><h2 id="home-menu-title">Меню BAHANDI</h2></div><Link to="/foods" className="text-link">Смотреть всё меню →</Link></div>
                <div className="home-grid" aria-busy={isLoading}>
                    {isLoading ? <><span className="sr-only" role="status">Загрузка меню</span>{[0, 1].map(i => <div key={i} className="home-card home-loading skeleton" aria-hidden="true" />)}</> : cards.length > 0 ? (
                        cards.map((card) => <HomeCard key={card.id} card={card} />)
                    ) : (
                        <div className="empty-state"><h3>Здесь пока пусто</h3><p>Категории меню появятся здесь, когда будут доступны.</p><Link className="text-link" to="/foods">Перейти в меню →</Link></div>
                    )}
                </div>
            </section>
        </div>
    );
}
