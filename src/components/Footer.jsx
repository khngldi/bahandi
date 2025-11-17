import "./footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-left">
                <h2>BAHANDI</h2>
                <p>© 2024 ТОО Баханди. Все права защищены</p>
            </div>
            <div className="footer-right">
                <ul>
                    <li><a href="">Бургеры</a></li>
                    <li><a href="">Напитки</a></li>
                    <li><a href="">Оферта</a></li>
                    <li><a href="">Политика конфиденциальности</a></li>
                    <li><a href="">Карта сайта</a></li>
                </ul>
            </div>
        </footer>
    );
}
