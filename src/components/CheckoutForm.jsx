import { useRef, useState } from "react";
import { useCart } from "../context/cartContext.js";
import { validateCheckout } from "../utils/validation.js";

export default function CheckoutForm({ onClose }) {
    const { cart, cartTotal, isCartEmpty } = useCart();
    const [values, setValues] = useState({ name: "", phone: "", method: "pickup", address: "", comment: "", confirmed: false });
    const [confirmedCart, setConfirmedCart] = useState("");
    const [errors, setErrors] = useState({});
    const [completed, setCompleted] = useState(false);
    const form = useRef(null);
    const signature = JSON.stringify(cart);
    const confirmed = values.confirmed && signature === confirmedCart;
    function change(e) {
        const { name, value, checked, type } = e.target;
        setValues(previous => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
        setErrors(previous => ({ ...previous, [name]: "" }));
        if (name === "confirmed") setConfirmedCart(signature);
    }
    function submit(e) {
        e.preventDefault();
        if (isCartEmpty || completed) return;
        const nextErrors = validateCheckout({ ...values, confirmed });
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            form.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
            return;
        }
        // Demo only: no network request, personal data is never persisted.
        setValues({ name: "", phone: "", method: "pickup", address: "", comment: "", confirmed: false });
        setCompleted(true);
    }
    const fieldProps = name => ({ name, id: `order-${name}`, value: values[name], onChange: change, "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `order-${name}-error` : undefined });
    const errorFor = name => errors[name] && <p className="field-error" id={`order-${name}-error`}>{errors[name]}</p>;
    if (completed) return <section className="checkout-form" role="status">
        <h3>Демонстрация завершена</h3>
        <p>Это демонстрационная версия. Заказ не отправлен в ресторан, оплата не проводилась. Корзина сохранена.</p>
        <button className="button" type="button" onClick={onClose}>Вернуться к корзине</button>
    </section>;
    return <form className="checkout-form" ref={form} onSubmit={submit} noValidate aria-labelledby="checkout-title">
        <h3 id="checkout-title">Демонстрационное оформление</h3>
        <p className="cart-note">Заказ не отправляется в ресторан. Онлайн-оплаты нет. Не вводите реальные данные для проверки.</p>
        <label htmlFor="order-name">Имя</label>
        <input {...fieldProps("name")} autoComplete="name" maxLength={80} required autoFocus />
        {errorFor("name")}
        <label htmlFor="order-phone">Телефон Казахстана</label>
        <input {...fieldProps("phone")} type="tel" autoComplete="tel" placeholder="+7 (701) 123-45-67" maxLength={24} required />
        {errorFor("phone")}
        <label htmlFor="order-method">Способ получения</label>
        <select {...fieldProps("method")}><option value="pickup">Самовывоз</option><option value="delivery">Доставка</option></select>
        {errorFor("method")}
        {values.method === "delivery" && <>
            <label htmlFor="order-address">Адрес доставки</label>
            <input {...fieldProps("address")} autoComplete="street-address" maxLength={200} required />
            {errorFor("address")}
        </>}
        <label htmlFor="order-comment">Комментарий к заказу</label>
        <textarea {...fieldProps("comment")} rows={3} maxLength={500} />
        {errorFor("comment")}
        <div className="order-summary"><h4>Состав заказа</h4><ul>{cart.map(item => <li key={item.id}>{item.name} × {item.quantity} — {Number(item.price) * item.quantity} ₸</li>)}</ul><strong>Итого: {cartTotal} ₸</strong></div>
        <label className="confirmation-label" htmlFor="order-confirmed"><input id="order-confirmed" name="confirmed" type="checkbox" checked={confirmed} onChange={change} aria-invalid={Boolean(errors.confirmed)} aria-describedby={errors.confirmed ? "order-confirmed-error" : undefined} />Подтверждаю состав и сумму {cartTotal} ₸. Понимаю, что это демонстрация.</label>
        {errorFor("confirmed")}
        <button className="button button-orange" type="submit" disabled={isCartEmpty}>Подтвердить демо-заказ</button>
        <button className="text-link" type="button" onClick={onClose}>Отмена</button>
    </form>;
}
