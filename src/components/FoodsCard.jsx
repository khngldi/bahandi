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
        <Link to={`/foods/${id}`}
              state={{ from: location.pathname + location.search }}
              className="drink-card"
        >
            <img src={image} alt={name} className="drink-img" />
            <div className="drink-info">
                <p className="drink-name">{name}</p>
                <p className="drink-price">{price} ₸</p>
                <button onClick={handleAddToCart} className="buy-btn">
                    В корзину
                </button>
            </div>
        </Link>
    );
}

export default FoodsCard;
