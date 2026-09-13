import { Link, useLocation } from "react-router-dom";
import "../components/home.css";

export default function HomeCard({ card }) {
    const location = useLocation();
    const { id, title, image, link, description } = card;

    const search = location.search;

    return (
        <Link to={`${link}${search}`} key={id} className="home-card">
            <img src={image} alt={title} className="home-card-img" />
            <div>
                <h3 className="home-card-title">{title}</h3>
                <p className="home-card-desc">{description}</p>
                <span className="home-card-arrow">Выбрать <span aria-hidden="true">→</span></span>
            </div>
        </Link>
    );
}
