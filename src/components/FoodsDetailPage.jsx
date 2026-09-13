import { useParams, Link, useLocation } from "react-router-dom";
import { useApiResource } from "../hooks/useApiResource.js";
import "../components/Detail.css";
import LoadingFoodsDetail from "./LoadingFoodsDetail.jsx";
import AddToCartButton from "./AddToCartButton.jsx";
import ApiError from "./ApiError.jsx";
import Comments from "./Comments.jsx";

export default function FoodsDetailPage() {
    const location = useLocation();
    const { id } = useParams();
    const { data: food, isLoading, error, retry } = useApiResource(`/foods/${id}`, "item");
    if (isLoading) return <LoadingFoodsDetail />;
    if (error) return <ApiError message={error} onRetry={retry} />;

    return (
        <div className="detail-page">
            <Link to={location.state?.from || "/foods"} className="detail-breadcrumb">← Назад в меню</Link>
            <div className="detail-product">
            <div className="detail-image-wrap"><img src={food.image} alt={typeof food.name === "string" ? food.name : "Название не указано"} className="detail-img" /></div>
            <div className="detail-copy">
            <p className="eyebrow">Меню BAHANDI</p>
            <h1 className="detail-title">{typeof food.name === "string" ? food.name : "Название не указано"}</h1>
            {typeof food.description === "string" && food.description && <p className="detail-text">{food.description}</p>}
            <p className="detail-price">
                <span>Цена:</span> {(typeof food.price === "number" || typeof food.price === "string") && Number.isFinite(Number(food.price)) ? `${food.price} ₸` : "Цена недоступна"}
            </p>
            <AddToCartButton key={id} product={food} detailed />
            <Link
                to={location.state?.from || "/foods"}
                className="back-btn"
            >
                Вернуться к выбору
            </Link>

            </div>
            </div>
            <Comments key={id} id={id} />
        </div>
    );
}
