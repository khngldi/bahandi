export default function ApiError({ message, onRetry }) {
    return <div className="error-container" role="alert">
        <img src="/images/error-icon.jpg" alt="" className="error-img" />
        <h2 className="error-text">Не удалось загрузить данные</h2>
        <p className="error-sub">{message}</p>
        <button className="button retry-button" type="button" onClick={onRetry}>Попробовать снова</button>
    </div>;
}
