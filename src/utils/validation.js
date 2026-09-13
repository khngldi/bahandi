export function searchFoods(foods, query, type) {
    const text = String(query ?? "").trim().toLocaleLowerCase("ru");
    return foods.filter(item => item && typeof item === "object" && !Array.isArray(item)
        && (!type || item.type === type)
        && (!text || [item.name, item.type, item.description].some(value => typeof value === "string" && value.toLocaleLowerCase("ru").includes(text))));
}

export function commentError(text) {
    if (!text.trim()) return "Комментарий не может быть пустым.";
    if (text.length > 500) return "Комментарий не должен превышать 500 символов.";
    return "";
}

export function formatCommentDate(value) {
    if (typeof value !== "string" && typeof value !== "number") return "Дата не указана";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Дата не указана" : date.toLocaleString("ru-RU");
}

export function validateCheckout(values) {
    const errors = {};
    if (values.name.trim().length < 2 || values.name.trim().length > 80) errors.name = "Введите имя: от 2 до 80 символов.";
    const phone = values.phone.replace(/[\s()+-]/g, "");
    if (!/^[78][67]\d{9}$/.test(phone)) errors.phone = "Введите телефон Казахстана, например +7 (701) 123-45-67.";
    if (!["delivery", "pickup"].includes(values.method)) errors.method = "Выберите способ получения.";
    if (values.method === "delivery" && (values.address.trim().length < 5 || values.address.trim().length > 200)) errors.address = "Укажите адрес доставки: от 5 до 200 символов.";
    if (values.comment.length > 500) errors.comment = "Максимум 500 символов.";
    if (!values.confirmed) errors.confirmed = "Подтвердите состав и сумму.";
    return errors;
}
