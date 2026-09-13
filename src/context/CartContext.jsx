import { useEffect, useMemo, useReducer, useState } from "react";
import { CartContext } from "./cartContext.js";
import { CART_STORAGE_KEY, cartReducer, cartTotals, restoreCart } from "./cartStore.js";

function loadCart() {
    try { return restoreCart(localStorage.getItem(CART_STORAGE_KEY)); }
    catch { return []; }
}

export default function CartProvider({ children }) {
    const [cart, dispatch] = useReducer(cartReducer, undefined, loadCart);
    const [storageError, setStorageError] = useState("");
    useEffect(() => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            setStorageError("");
        } catch {
            setStorageError("Браузер не разрешил сохранить корзину. Она доступна до перезагрузки страницы.");
        }
    }, [cart]);
    const actions = useMemo(() => ({
        addToCart: product => dispatch({ type: "add", product }),
        incrementQuantity: id => dispatch({ type: "increment", id }),
        decrementQuantity: id => dispatch({ type: "decrement", id }),
        removeFromCart: id => dispatch({ type: "remove", id }),
        clearCart: () => dispatch({ type: "clear" }),
    }), []);
    const value = useMemo(() => ({ cart, ...cartTotals(cart), ...actions, storageError }), [cart, actions, storageError]);
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
