import { useCallback, useEffect, useState } from "react";
import { api, apiErrorMessage } from "../api/client.js";

export function useApiResource(path, kind = "list") {
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState({ path: null, data: null, isLoading: true, error: "" });
    useEffect(() => {
        const controller = new AbortController();
        setState({ path, data: null, isLoading: true, error: "" });
        async function load() {
            try {
                const { data } = await api.get(path, { signal: controller.signal });
                const valid = kind === "list" ? Array.isArray(data) : data && typeof data === "object" && !Array.isArray(data) && data.id != null;
                if (!valid) throw new Error("Invalid API response");
                if (!controller.signal.aborted) {
                    setState({ path, data, isLoading: false, error: "" });
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setState({ path, data: null, isLoading: false, error: apiErrorMessage(error) });
                }
            }
        }
        load();
        return () => controller.abort();
    }, [path, kind, attempt]);
    const retry = useCallback(() => setAttempt(value => value + 1), []);
    return { ...(state.path === path ? state : { data: null, isLoading: true, error: "" }), retry };
}
