import Home from "../pages/Home.jsx";
import Foods from "../pages/Foods.jsx";
import FoodDetailPage from "../components/FoodsDetailPage.jsx";

import {
    HOME_PAGE_ROUTE,
    FOODS_PAGE_ROUTE,
    FOOD_DETAIL_ROUTE
} from "./consts";

export const routes = [
    { path: HOME_PAGE_ROUTE, element: Home },
    { path: FOODS_PAGE_ROUTE, element: Foods },
    { path: FOOD_DETAIL_ROUTE, element: FoodDetailPage },
];
