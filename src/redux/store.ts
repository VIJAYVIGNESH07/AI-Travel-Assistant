import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import preferencesReducer from './slices/preferencesSlice';
import onboardingReducer from './slices/onboardingSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    preferences: preferencesReducer,
    onboarding: onboardingReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
