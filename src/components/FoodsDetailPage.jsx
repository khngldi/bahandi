import { useParams, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "../components/Detail.css";
import LoadingFoodsDetail from "../components/LoadingFoodsDetail.jsx";

export default function FoodsDetailPage() {

    const location = useLocation();

    const { id } = useParams();
    const [food, setFood] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isSubmitting, setIssubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [commentText, setCommentText] = useState('');

    const [comments, setComments] = useState([]);

    useEffect(() => {
        async function fetchFood() {
            try {
                const response = await axios.get(
                    `https://8793bad894280e6b.mokky.dev/foods/${id}`
                );
                setFood(response.data);
            } catch (err) {
                console.error(err);
                setError("Ошибка загрузки товара");
            } finally {
                setLoading(false);
            }
        }

        async function fetchComments() {
            try {
                const response = await axios.get(
                    `https://8793bad894280e6b.mokky.dev/comments?post_id=${id}`
                );

                const sorted = response.data.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );

                setComments(sorted);
            } catch (err) {
                console.error("Ошибка загрузки комментариев:", err);
            }
        }


        fetchFood();
        fetchComments();
    }, [id]);

    if (isLoading) return <LoadingFoodsDetail />;

    if (error) {
        return (
            <div className="error-container">
                <img src="/images/error-icon.jpg" alt="Ошибка" className="error-img" />
                <h2 className="error-text">{error}</h2>
                <p className="error-sub">Попробуйте обновить страницу позже.</p>
            </div>
        );
    }

    async function SubmitComment(e) {
        e.preventDefault();
        if (!commentText.trim()) {
            setSubmitMessage('Комментарий не может быть пустым');
            return;
        }

        setIssubmitting(true);
        setSubmitMessage("Отправка комментария...");

        try {
            const commentUrl = 'https://8793bad894280e6b.mokky.dev/comments';
            const commentData = {
                post_id: id,
                text: commentText,
                createdAt: new Date().toISOString()
            };

            const response = await axios.post(commentUrl, commentData);

            if (response.status === 201 || response.status === 200) {
                setSubmitMessage('Комментарий успешно отправлен!');
                setCommentText('');

                const newComment = response.data;
                setComments((prev) => [newComment, ...prev]);
            } else {
                setSubmitMessage('Ошибка при отправке комментария');
            }
        } catch (error) {
            console.error(error);
            setSubmitMessage('Ошибка при отправке комментария');
        } finally {
            setIssubmitting(false);
            setTimeout(() => setSubmitMessage(''), 4000);
        }
    }


    return (
        <div className="detail-page">
            <h1 className="detail-title">{food.name}</h1>
            <img src={food.image} alt={food.name} className="detail-img" />
            <p className="detail-text">
                <span>Цена:</span> {food.price} ₸
            </p>
            <Link
                to={location.state?.from || "/foods"}
                className="back-btn"
            >
                Назад
            </Link>

            <form onSubmit={SubmitComment} className="comment-form">
                <label htmlFor="comment" className="comment-label">Оставьте комментарий</label>
                <input
                    type="text"
                    id="comment"
                    name="comment"
                    className="comment-input"
                    placeholder="Ваш комментарий..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                    type="submit"
                    className="comment-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Отправка...' : 'Отправить'}
                </button>
            </form>

            {submitMessage && <p className="comment-message">{submitMessage}</p>}

            <div className="comments-section">
                <h3 className="comments-title">Комментарии:</h3>

                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                            <p className="comment-text">{comment.text}</p>
                            <small className="comment-date">
                                {new Date(comment.createdAt).toLocaleString('ru-RU')}
                            </small>
                        </div>
                    ))
                ) : (
                    <p className="no-comments">Пока нет комментариев</p>
                )}
            </div>
        </div>
    );
}
