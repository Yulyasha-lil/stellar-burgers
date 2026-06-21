import {
  forgotPasswordApi,
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  resetPasswordApi,
  TLoginData,
  TRegisterData,
  updateUserApi
} from '../../utils/burger-api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TUser } from '../../utils/types';
import { deleteCookie, getCookie, setCookie } from '../../utils/cookie';

interface User {
  isAuthChecked: boolean;
  user: TUser | null;
  error: string | null;
}

export const initialState: User = {
  isAuthChecked: false,
  user: null,
  error: null
};

export const registerUser = createAsyncThunk(
  'user/registerUser',
  (data: TRegisterData) => registerUserApi(data)
);

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async (data: TLoginData) => {
    const response = await loginUserApi(data);
    setCookie('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response;
  }
);

export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (data: { email: string }) => await forgotPasswordApi(data)
);

export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async (data: { password: string; token: string }) =>
    await resetPasswordApi(data)
);

export const checkUser = createAsyncThunk(
  'user/checkUser',
  async (_, { dispatch }) => {
    if (getCookie('accessToken')) {
      return await getUserApi();
    } else {
      dispatch(setIsAuthChecked(true));
      return null;
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async function (data: TRegisterData) {
    const response = await updateUserApi(data);
    return response;
  }
);

export const logout = createAsyncThunk('user/logout', async () => {
  const response = await logoutApi();
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
  return response;
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setIsAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    },
    setUser: (state, action: PayloadAction<TUser>) => {
      state.user = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => {
      state.isAuthChecked = true;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.error = action.error.message as string;
      state.isAuthChecked = false;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isAuthChecked = true;
      state.error = null;
      state.user = action.payload.user;
      setCookie('accessToken', action.payload.accessToken);
    });
    builder.addCase(loginUser.pending, (state) => {
      state.isAuthChecked = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isAuthChecked = false;
      state.error = action.error.message as string;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isAuthChecked = true;
      state.error = null;
      state.user = action.payload.user;
      setCookie('accessToken', action.payload.accessToken);
    });
    builder.addCase(logout.pending, (state) => {
      state.error = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.error = action.error.message as string;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.error = null;
      state.user = { email: '', name: '' };
      deleteCookie('accessToken');
      state.isAuthChecked = false;
    });
    builder.addCase(updateUser.pending, (state) => {
      state.error = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.isAuthChecked = true;
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.error = action.error.message as string;
    });
    builder.addCase(checkUser.pending, (state) => {
      state.error = null;
    });
    builder.addCase(checkUser.fulfilled, (state, action) => {
      state.error = null;
      state.isAuthChecked = true;
      state.user = action.payload?.user ?? null;
    });
    builder.addCase(checkUser.rejected, (state, action) => {
      state.error = action.error.message as string;
      state.isAuthChecked = true;
      state.user = null;
      deleteCookie('accessToken');
      localStorage.removeItem('refreshToken');
    });
  }
});

export const { setIsAuthChecked, setUser } = userSlice.actions;
export const userReducer = userSlice.reducer;
