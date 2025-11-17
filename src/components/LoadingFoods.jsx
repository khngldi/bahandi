import './array.css';

export default function LoadingFoods() {
    return (
        <div className="loading-card-wrapper">
            <div className="loading-card-container">
                <div className="skeleton skeleton-img" />
                <div className="skeleton skeleton-title" />
                <div className="skeleton skeleton-text" />
            </div>
        </div>
    );
}
