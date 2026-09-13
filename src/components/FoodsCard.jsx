import './array.css';
import AddToCartButton from './AddToCartButton.jsx';
import {Link, useLocation} from "react-router-dom";

function FoodsCard({ product }) {
    const { id, name, price, image } = product;
    const title = typeof name === "string" && name.trim() ? name : "Название не указано";

    const location = useLocation();

    return (
        <article className="drink-card">
            <Link to={id != null && ["string", "number"].includes(typeof id) ? `/foods/${encodeURIComponent(id)}` : "/foods"} state={{ from: location.pathname + location.search }} className="drink-card-link">
                <img src={image} alt={title} className="drink-img" loading="lazy" />
                <div className="drink-info">
                    <p className="drink-type">{product.type === "drink" ? "Напитки" : product.type === "chicken" ? "Бургеры с курицей" : "Меню BAHANDI"}</p>
                    <h2 className="drink-name">{title}</h2>
                    {typeof product.description === "string" && product.description && <p className="drink-description">{product.description}</p>}
                </div>
            </Link>
            <div className="drink-actions">
                <p className="drink-price">{(typeof price === "number" || typeof price === "string") && Number.isFinite(Number(price)) ? `${price} ₸` : "Цена недоступна"}</p>
                <AddToCartButton product={product} />
            </div>
        </article>
    );
}

export default FoodsCard;
