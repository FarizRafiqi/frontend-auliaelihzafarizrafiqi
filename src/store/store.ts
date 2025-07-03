import { configureStore } from '@reduxjs/toolkit';
import countriesReducer from './country-slice';
import harborReducer from './harbor-slice';
import itemReducer from './item-slice';

export const store = configureStore({
  reducer: {
    countries: countriesReducer,
    harbors: harborReducer,
    items: itemReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
