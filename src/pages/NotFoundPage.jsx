import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return <section className="error-container">
        <p className="eyebrow">404 / BAHANDI</p>
        <h1>Страница не найдена</h1>
        <p className="error-sub">Проверьте адрес или вернитесь к выбору блюд.</p>
        <div className="form-actions"><Link className="button" to="/">На главную</Link><Link className="button button-orange" to="/foods">В меню</Link></div>
    </section>;
}
