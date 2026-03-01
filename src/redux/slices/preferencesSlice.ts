import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type PreferencesState = {
  darkMode: boolean;
  reduceMotion: boolean;
  language: string;
  units: 'metric' | 'imperial';
  mapStyle: 'light' | 'dark';
};

const initialState: PreferencesState = {
  darkMode: false,
  reduceMotion: false,
  language: 'English',
  units: 'metric',
  mapStyle: 'dark'
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    setReduceMotion(state, action: PayloadAction<boolean>) {
      state.reduceMotion = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setUnits(state, action: PayloadAction<'metric' | 'imperial'>) {
      state.units = action.payload;
    },
    setMapStyle(state, action: PayloadAction<'light' | 'dark'>) {
      state.mapStyle = action.payload;
    }
  }
});

export const { toggleDarkMode, setReduceMotion, setLanguage, setUnits, setMapStyle } = preferencesSlice.actions;
export default preferencesSlice.reducer;
