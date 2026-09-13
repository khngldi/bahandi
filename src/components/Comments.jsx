import { useEffect, useRef, useState } from "react";
import { api, apiErrorMessage } from "../api/client.js";
import { useApiResource } from "../hooks/useApiResource.js";
import { commentError, formatCommentDate } from "../utils/validation.js";

export default function Comments({ id }) {
    const { data, error, isLoading, retry } = useApiResource(`/comments?post_id=${id}`);
    const [posted, setPosted] = useState([]);
    const [text, setText] = useState("");
    const [message, setMessage] = useState(null);
    const [isSubmitting, setSubmitting] = useState(false);
    const pending = useRef(null);
    useEffect(() => () => pending.current?.abort(), []);
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(null), 6000);
        return () => clearTimeout(timer);
    }, [message]);
    const comments = [...posted, ...(data || []).filter(comment => !posted.some(item => item.id === comment?.id))]
        .filter(comment => comment && typeof comment.text === "string")
        .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
    async function submit(e) {
        e.preventDefault();
        if (pending.current || isLoading) return;
        const validation = commentError(text);
        if (validation) { setMessage({ type: "error", text: validation }); return; }
        const controller = new AbortController();
        pending.current = controller;
        setSubmitting(true);
        setMessage(null);
        try {
            const response = await api.post("/comments", { post_id: id, text: text.trim(), createdAt: new Date().toISOString() }, { signal: controller.signal });
            if (controller.signal.aborted) return;
            if (![200, 201].includes(response.status) || !response.data || typeof response.data.text !== "string") throw new Error("Invalid comment response");
            setPosted(previous => [response.data, ...previous]);
            setText("");
            setMessage({ type: "success", text: "Комментарий успешно отправлен!" });
        } catch (error) {
            if (!controller.signal.aborted) setMessage({ type: "error", text: `Комментарий не отправлен. ${apiErrorMessage(error)}` });
        } finally {
            if (!controller.signal.aborted) { pending.current = null; setSubmitting(false); }
        }
    }
    return <div className="detail-discussion">
        <form onSubmit={submit} className="comment-form">
            <label htmlFor="comment" className="comment-label">Оставьте комментарий</label>
            <textarea rows={3} id="comment" name="comment" className="comment-input" placeholder="Ваш комментарий…" value={text}
                onChange={e => setText(e.target.value)} maxLength={500} disabled={isSubmitting} aria-describedby="comment-remaining comment-feedback" aria-invalid={message?.type === "error"} />
            <small id="comment-remaining" className="cart-note">Осталось символов: {Math.max(0, 500 - text.length)}</small>
            <button type="submit" className="comment-btn" disabled={isSubmitting || isLoading || text.length > 500}>{isSubmitting ? "Отправка…" : "Отправить"}</button>
        </form>
        <div id="comment-feedback" aria-live="polite">{message && <p className={`comment-message${message.type === "error" ? " is-error" : ""}`}>{message.text}</p>}</div>
        <section className="comments-section" aria-busy={isLoading}>
            <h2 className="comments-title">Комментарии ({comments.length})</h2>
            {isLoading && <p role="status">Загрузка комментариев…</p>}
            {error && <div role="alert"><p className="field-error">Не удалось загрузить комментарии. {error}</p><button className="text-link" type="button" onClick={retry}>Попробовать снова</button></div>}
            {comments.map((comment, index) => <div key={comment.id ?? index} className="comment-item"><p className="comment-text">{comment.text}</p><small className="comment-date">{formatCommentDate(comment.createdAt)}</small></div>)}
            {!isLoading && !error && !comments.length && <p className="no-comments">Пока нет комментариев. Поделитесь первым впечатлением.</p>}
        </section>
    </div>;
}
