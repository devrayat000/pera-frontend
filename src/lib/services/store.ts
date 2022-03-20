import { useLayoutEffect } from 'react'
import create, { UseBoundStore } from 'zustand'
import createContext from 'zustand/context'
import { devtools } from 'zustand/middleware'

export interface InitialState {
  drawer: {
    state: boolean
  }
}

export interface StoreModel extends InitialState {
  drawer: {
    state: boolean
    toggle(): void
  }
}

let store: UseBoundStore<StoreModel> | undefined

const initialState: InitialState = {
  drawer: { state: false },
}

const zustandContext = createContext<StoreModel>()

export const Provider = zustandContext.Provider
export const useStore = zustandContext.useStore

export const initializeStore = (preloadedState?: InitialState) => {
  return create<StoreModel>(
    devtools(
      (set, get) => ({
        drawer: {
          ...initialState.drawer,
          ...preloadedState?.drawer,
          toggle() {
            set(prev => ({
              drawer: {
                ...prev.drawer,
                state: !prev.drawer.state,
              },
            }))
          },
        },
      }),
      { name: 'pera-store' }
    )
  )
}

export function useCreateStore(initialState?: InitialState) {
  // For SSR & SSG, always use a new store.
  if (typeof window === 'undefined') {
    return () => initializeStore(initialState)
  }

  // For CSR, always re-use same store.
  store = store ?? initializeStore(initialState)
  // And if initialState changes, then merge states in the next render cycle.
  //
  // eslint complaining "React Hooks must be called in the exact same order in every component render"
  // is ignorable as this code runs in same order in a given environment
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useLayoutEffect(() => {
    if (initialState && store) {
      store.setState({
        drawer: {
          ...store.getState().drawer,
          ...initialState.drawer,
        },
      })
    }
  }, [initialState])

  return () => store!
}