import "./footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner container">
            <div className="footer-left">
                <Link className="footer-brand" to="/">BAHANDI</Link>
                <p>© 2024 ТОО Баханди. Все права защищены</p>
            </div>
            <div className="footer-right">
                <ul>
                    <li><Link to="/foods?type=chicken">Бургеры</Link></li>
                    <li><Link to="/foods?type=drink">Напитки</Link></li>
                    <li><a href="">Оферта</a></li>
                    <li><a href="">Политика конфиденциальности</a></li>
                    <li><a href="">Карта сайта</a></li>
                </ul>
            </div>
            </div>
        </footer>
    );
}
