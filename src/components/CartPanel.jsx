import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "../context/cartContext.js";
import { MAX_QUANTITY } from "../context/cartStore.js";
import CheckoutForm from "./CheckoutForm.jsx";

function CheckoutLauncher() {
    const [open, setOpen] = useState(false);
    const trigger = useRef(null);
    const restoreFocus = useRef(false);
    useEffect(() => {
        if (!open && restoreFocus.current) trigger.current?.focus();
    }, [open]);
    return <>
        <button className="button button-orange checkout-trigger" ref={trigger} type="button" onClick={() => setOpen(true)} disabled={open}>Оформить заказ</button>
        {open && <CheckoutForm onClose={() => { restoreFocus.current = true; setOpen(false); }} />}
    </>;
}

export default function CartPanel() {
    const { cart, cartCount, cartTotal, isCartEmpty, incrementQuantity, decrementQuantity, removeFromCart, clearCart, storageError } = useCart();
    const location = useLocation();
    const panel = useRef(null);
    useEffect(() => {
        if (location.hash !== "#cart") return;
        const frame = requestAnimationFrame(() => {
            panel.current?.scrollIntoView({ block: "start" });
            panel.current?.focus({ preventScroll: true });
        });
        return () => cancelAnimationFrame(frame);
    }, [location.key, location.hash]);
    function clear() {
        if (!isCartEmpty && window.confirm("Удалить все товары из корзины?")) clearCart();
    }
    return <aside className="cart-panel" id="cart" ref={panel} tabIndex={-1} aria-labelledby="cart-title">
        <h2 id="cart-title">Ваша корзина</h2>
        <p className="cart-count" role="status">Блюд в корзине: {cartCount}</p>
        {storageError && <p className="field-error" role="status">{storageError}</p>}
        {isCartEmpty ? <p className="cart-note">Добавьте что-нибудь из меню.</p> : <ul className="cart-items">{cart.map(item => <li key={item.id} className="cart-item">
            <span className="cart-item-name">{item.name}</span>
            <span className="cart-note">{item.price} ₸ за шт. · Итого {Number(item.price) * item.quantity} ₸</span>
            <div className="quantity-controls">
                <button type="button" aria-label={`Уменьшить количество: ${item.name}${item.quantity === 1 ? ". Удалить последнюю позицию" : ""}`} onClick={() => decrementQuantity(item.id)}>−</button>
                <span aria-label="Количество">{item.quantity}</span>
                <button type="button" aria-label={`Увеличить количество: ${item.name}`} onClick={() => incrementQuantity(item.id)} disabled={item.quantity >= MAX_QUANTITY}>+</button>
                <button className="remove-item" type="button" aria-label={`Удалить: ${item.name}`} onClick={() => removeFromCart(item.id)}>Удалить</button>
            </div>
        </li>)}</ul>}
        <p className="cart-total"><span>Общая сумма</span><strong>{cartTotal} ₸</strong></p>
        <button className="text-link clear-cart" type="button" onClick={clear} disabled={isCartEmpty}>Очистить корзину</button>
        {!isCartEmpty && <CheckoutLauncher />}
    </aside>;
}
