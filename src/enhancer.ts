import { AnyAction, PreloadedState, Reducer, StoreEnhancer, StoreEnhancerStoreCreator } from 'redux'
import { ACTIONS_TYPES } from './constants'
import { Dispatcher, Enhancer, StoreListener } from './typings'

const mergeReducer: Reducer = (state, action) => {
  const rootState = state
  const mergeInState = action.state
  if (typeof rootState === 'object') {
    return { ...rootState, ...mergeInState }
  } else {
    return mergeInState
  }
}

const enhanceReducer: Enhancer<Reducer> = mainReducer => (state, action) => {
  switch (action.type) {
    case ACTIONS_TYPES.MERGE_STATE_TYPE: return mergeReducer(state, action)
    case ACTIONS_TYPES.SET_STATE_TYPE: return action.state
    default: return mainReducer(state, action)
  }
}

let _store: any

export const getStore = (): any => _store

const enhancer: StoreEnhancer<any> = (createStore: StoreEnhancerStoreCreator) => <S, A extends AnyAction>(reducer: Reducer<S, A>, state?: PreloadedState<S>) => {
  const store = createStore(enhanceReducer(reducer), state)

  const enhanceDispatch: Enhancer<Dispatcher> = dispatch => action => {
    const prev = store.getState()
    dispatch(action)
    const next = store.getState()
    if (listener !== null) listener(action, prev, next)
  }

  let listener: StoreListener = null

  const enhancedStore = {
    ...store,
    dispatch: enhanceDispatch(store.dispatch),
    __WITH_REDUX_ENABLED__: {
      listenToStateChange: (l: StoreListener) => (listener = l)
    }
  }

  _store = enhancedStore

  return enhancedStore
}

export default enhancer
