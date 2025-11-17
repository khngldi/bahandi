import "../components/Detail.css";

export default function LoadingFoodsDetail() {
    return (
        <div className="loading-detail-wrapper">
            <div className="loading-detail-container">
                <div className="skeleton skeleton-img-detail"></div>
                <div className="skeleton skeleton-title-detail"></div>
                <div className="skeleton skeleton-text-detail"></div>
                <div className="skeleton skeleton-button-detail"></div>
            </div>
        </div>
    );
}
