import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/cartContext.js";
import { canAddProduct, MAX_QUANTITY } from "../context/cartStore.js";

export default function AddToCartButton({ product, detailed = false }) {
    const { cart, addToCart } = useCart();
    const [added, setAdded] = useState(false);
    const timer = useRef(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    const atLimit = cart.some(item => String(item.id) === String(product?.id) && item.quantity >= MAX_QUANTITY);
    const disabled = !canAddProduct(product) || atLimit;
    function add() {
        if (disabled) return;
        addToCart(product);
        setAdded(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1200);
    }
    return <button type="button" className={`buy-btn${added ? " is-added" : ""}`} onClick={add} disabled={disabled}
        aria-label={`${atLimit ? "Достигнут лимит 999 шт." : "В корзину"}: ${product?.name || "Блюдо недоступно"}`}>
        <span aria-live="polite">{added ? "✓ Добавлено" : atLimit ? "Максимум 999 шт." : detailed ? "Добавить в корзину" : "+ В корзину"}</span>
    </button>;
}
