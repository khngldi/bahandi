import test from "node:test";
import assert from "node:assert/strict";
import { cartReducer, cartTotals, restoreCart, canAddProduct, MAX_QUANTITY } from "../src/context/cartStore.js";
import { searchFoods, commentError, formatCommentDate, validateCheckout } from "../src/utils/validation.js";

const product = { id: 1, name: "Бургер", price: 1200, type: "chicken" };
test("same product increments, totals derive from cart, original data stays immutable", () => {
    const first = cartReducer([], { type: "add", product });
    const next = cartReducer(first, { type: "add", product });
    assert.equal(next.length, 1);
    assert.equal(next[0].quantity, 2);
    assert.equal(first[0].quantity, 1);
    assert.deepEqual(cartTotals(next), { cartCount: 2, cartTotal: 2400, isCartEmpty: false });
});
test("decrement one removes the item; remove and clear preserve empty invariants", () => {
    let cart = cartReducer([], { type: "add", product });
    cart = cartReducer(cart, { type: "increment", id: 1 });
    cart = cartReducer(cart, { type: "decrement", id: 1 });
    assert.equal(cart[0].quantity, 1);
    assert.deepEqual(cartReducer(cart, { type: "decrement", id: 1 }), []);
    assert.deepEqual(cartReducer(cart, { type: "remove", id: 1 }), []);
    assert.deepEqual(cartReducer(cart, { type: "clear" }), []);
    assert.deepEqual(cartTotals([]), { cartCount: 0, cartTotal: 0, isCartEmpty: true });
});
test("corrupt/non-array storage and invalid entries are rejected", () => {
    for (const raw of ["{broken", "null", "{}", "42", "false"]) assert.deepEqual(restoreCart(raw), []);
    const values = [null, {}, { ...product, quantity: -1 }, { ...product, quantity: 1.5 }, { ...product, quantity: 1, price: "NaN" }, { ...product, quantity: MAX_QUANTITY + 1 }];
    assert.deepEqual(restoreCart(JSON.stringify(values)), []);
});
test("restoration preserves data, handles duplicate IDs, and caps quantities", () => {
    const data = [{ ...product, quantity: 2 }, { ...product, id: "1", quantity: 3 }];
    const restored = restoreCart(JSON.stringify(data));
    assert.equal(restored.length, 1);
    assert.equal(restored[0].quantity, 5);
    assert.equal(restored[0].type, "chicken");
    assert.equal(cartReducer([{ ...product, quantity: MAX_QUANTITY }], { type: "increment", id: 1 })[0].quantity, MAX_QUANTITY);
});
test("missing/invalid product fields cannot be added; zero price remains valid", () => {
    for (const value of [null, {}, { ...product, name: null }, { ...product, price: -5 }, { ...product, price: "" }, { ...product, id: {} }]) assert.equal(canAddProduct(value), false);
    assert.equal(canAddProduct({ ...product, price: 0 }), true);
    assert.deepEqual(cartReducer([], { type: "add", product: {} }), []);
});
test("search handles whitespace, case, description, and incomplete API records", () => {
    const foods = [null, { id: 2 }, { ...product, description: "ХРУСТЯЩИЙ" }, { id: 3, name: null, type: null, description: {} }];
    assert.equal(searchFoods(foods, "  хрустящий ", "chicken").length, 1);
    assert.equal(searchFoods(foods, " БУРГЕР ", null).length, 1);
    assert.equal(searchFoods(foods, "unknown", null).length, 0);
    assert.equal(searchFoods(foods, " ", null).length, 3);
});
test("empty and overlong comments are rejected; exact maximum allowed", () => {
    assert.ok(commentError("  "));
    assert.ok(commentError("я".repeat(501)));
    assert.equal(commentError("я".repeat(500)), "");
    assert.equal(commentError(" Спасибо! "), "");
});
test("invalid comment dates never render Invalid Date", () => {
    for (const value of [null, undefined, {}, "invalid", ""]) assert.equal(formatCommentDate(value), "Дата не указана");
    assert.notEqual(formatCommentDate("2026-09-13T10:00:00Z"), "Дата не указана");
});
const order = { name: "Тест", phone: "+7 (701) 123-45-67", method: "pickup", address: "", comment: "", confirmed: true };
test("checkout validates Kazakhstan phone, pickup, delivery address and confirmation", () => {
    assert.deepEqual(validateCheckout(order), {});
    assert.deepEqual(validateCheckout({ ...order, phone: "87011234567" }), {});
    assert.ok(validateCheckout({ ...order, phone: "+1 701 1234567" }).phone);
    assert.ok(validateCheckout({ ...order, phone: "+7 901 1234567" }).phone);
    assert.ok(validateCheckout({ ...order, method: "delivery" }).address);
    assert.deepEqual(validateCheckout({ ...order, method: "delivery", address: "Тестовый адрес 1" }), {});
    assert.ok(validateCheckout({ ...order, confirmed: false }).confirmed);
    assert.ok(validateCheckout({ ...order, comment: "я".repeat(501) }).comment);
});
