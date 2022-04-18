import { createStore, applyMiddleware,compose} from 'redux';
import thunk from 'redux-thunk';
// import reducer from '../reducers';
import rootReducer from '../reducers';
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// export default store = createStore(reducer, applyMiddleware(thunk));
export default store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));