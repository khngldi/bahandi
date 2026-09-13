export const CART_STORAGE_KEY = "bahandi_cart_v1";
export const MAX_QUANTITY = 999;

export function canAddProduct(product) {
    return Boolean(product && typeof product === "object" && !Array.isArray(product)
        && ((typeof product.id === "number" && Number.isFinite(product.id)) || (typeof product.id === "string" && product.id.trim()))
        && typeof product.name === "string" && product.name.trim()
        && (typeof product.price === "number" || (typeof product.price === "string" && product.price.trim()))
        && Number.isFinite(Number(product.price)) && Number(product.price) >= 0
        && Number(product.price) <= Number.MAX_SAFE_INTEGER / MAX_QUANTITY);
}

const sameId = (a, b) => String(a) === String(b);

export function restoreCart(raw) {
    try {
        const value = JSON.parse(raw);
        if (!Array.isArray(value)) return [];
        const cart = [];
        for (const item of value) {
            if (!canAddProduct(item) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) continue;
            const existing = cart.find(entry => sameId(entry.id, item.id));
            if (existing) existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + item.quantity);
            else cart.push({ ...item });
        }
        return cart;
    } catch {
        return [];
    }
}

export function cartReducer(cart, action) {
    switch (action.type) {
        case "add": {
            if (!canAddProduct(action.product)) return cart;
            const found = cart.some(item => sameId(item.id, action.product.id));
            return found ? cartReducer(cart, { type: "increment", id: action.product.id }) : [...cart, { ...action.product, quantity: 1 }];
        }
        case "increment":
            return cart.map(item => sameId(item.id, action.id) ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + 1) } : item);
        case "decrement":
            return cart.flatMap(item => sameId(item.id, action.id) ? (item.quantity === 1 ? [] : [{ ...item, quantity: item.quantity - 1 }]) : [item]);
        case "remove":
            return cart.filter(item => !sameId(item.id, action.id));
        case "clear": return [];
        default: return cart;
    }
}

export function cartTotals(cart) {
    return {
        cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        cartTotal: Math.round(cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) * 100) / 100,
        isCartEmpty: cart.length === 0,
    };
}
