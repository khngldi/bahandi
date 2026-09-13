import axios from "axios";

export const API_BASE_URL = "https://8793bad894280e6b.mokky.dev";
export const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

export function apiErrorMessage(error) {
    if (error?.response?.status === 404) return "Запрашиваемые данные не найдены.";
    if (error?.response?.status === 429) return "Слишком много запросов. Попробуйте немного позже.";
    if (error?.code === "ECONNABORTED") return "Сервер не ответил вовремя. Попробуйте снова.";
    if (error?.response) return "Сервер временно недоступен. Попробуйте снова.";
    if (axios.isAxiosError(error)) return "Не удалось подключиться. Проверьте интернет и попробуйте снова.";
    return "Сервер вернул некорректные данные. Попробуйте снова.";
}
