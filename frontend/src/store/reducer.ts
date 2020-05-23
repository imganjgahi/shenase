
import { AuthReducer } from "../actions/Auth/reducer";
import { PanelReducer } from "../actions/Panel/reducer";
import { ProductReducer } from "../actions/Products/reducer";
import { CategoryReducer } from "../actions/Category/reducer";
import { GeneratorReducer } from "../actions/Generator/reducer";

export const reducers = {
    auth: AuthReducer,
    panel: PanelReducer,
    product: ProductReducer,
    category: CategoryReducer,
    generator: GeneratorReducer
}