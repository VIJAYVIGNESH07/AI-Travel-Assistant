import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type UserProfile = {
  name: string;
  handle: string;
  location: string;
  avatar: string;
  bio: string;
  backgroundImage: string;
};

type AuthState = {
  isSignedIn: boolean;
  user: UserProfile | null;
};

const initialState: AuthState = {
  isSignedIn: false,
  user: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signIn(state, action: PayloadAction<UserProfile>) {
      state.isSignedIn = true;
      state.user = action.payload;
    },
    signOut(state) {
      state.isSignedIn = false;
      state.user = null;
    }
  }
});

export const { signIn, signOut } = authSlice.actions;
export default authSlice.reducer;
