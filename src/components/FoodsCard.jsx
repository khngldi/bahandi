import './array.css';
import {Link, useLocation} from "react-router-dom";

function FoodsCard({ product, onAddToCart }) {
    const { id, name, price, image } = product;

    const location = useLocation();

    const handleAddToCart = (e) => {
        e.preventDefault();
        onAddToCart(product);
    };

    return (
        <article className="drink-card">
            <Link to={`/foods/${id}`} state={{ from: location.pathname + location.search }} className="drink-card-link">
                <img src={image} alt={name} className="drink-img" loading="lazy" />
                <div className="drink-info">
                    <p className="drink-type">{product.type === "drink" ? "Напитки" : product.type === "chicken" ? "Бургеры с курицей" : "Меню BAHANDI"}</p>
                    <h2 className="drink-name">{name}</h2>
                    {product.description && <p className="drink-description">{product.description}</p>}
                </div>
            </Link>
            <div className="drink-actions">
                <p className="drink-price">{price} ₸</p>
                <button onClick={handleAddToCart} className="buy-btn" aria-label={`В корзину: ${name}`}>+ В корзину</button>
            </div>
        </article>
    );
}

export default FoodsCard;
