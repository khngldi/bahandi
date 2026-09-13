import "../components/Detail.css";

export default function LoadingFoodsDetail() {
    return (
        <div className="loading-detail-wrapper" role="status" aria-label="Загрузка блюда">
            <div className="loading-detail-container" aria-hidden="true">
                <div className="skeleton skeleton-img-detail"></div>
                <div className="loading-detail-copy">
                <div className="skeleton skeleton-title-detail"></div>
                <div className="skeleton skeleton-text-detail"></div>
                <div className="skeleton skeleton-button-detail"></div>
                </div>
            </div>
        </div>
    );
}
