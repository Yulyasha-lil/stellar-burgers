import {
  userReducer,
  initialState,
  registerUser,
  loginUser,
  checkUser,
  logout,
  updateUser,
  setIsAuthChecked,
  setUser
} from '../user-slice';
import { TAuthResponse, TUserResponse } from '../../../utils/burger-api';

describe('userSlice reducer', () => {
  it('should return initial state with UNKNOWN action', () => {
    const result = userReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  it('should handle setIsAuthChecked', () => {
    const result = userReducer(initialState, setIsAuthChecked(true));
    expect(result.isAuthChecked).toBe(true);
  });

  it('should handle setUser', () => {
    const user = { email: 'test@test.com', name: 'Test User' };
    const result = userReducer(initialState, setUser(user));
    expect(result.user).toEqual(user);
  });

  describe('registerUser', () => {
    const mockUser = {
      email: 'test@test.com',
      name: 'Test User',
      password: '123456'
    };

    it('should handle pending', () => {
      const result = userReducer(
        initialState,
        registerUser.pending('', mockUser)
      );
      expect(result.isLoading).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle fulfilled', () => {
      const user = { email: 'test@test.com', name: 'Test User' };
      const payload: TAuthResponse = {
        success: true,
        user,
        accessToken: 'token',
        refreshToken: 'refresh'
      };
      const result = userReducer(
        initialState,
        registerUser.fulfilled(payload, '', mockUser)
      );
      expect(result.isLoading).toBe(false);
      expect(result.user).toEqual(user);
      expect(result.isAuthChecked).toBe(true);
    });

    it('should handle rejected', () => {
      const error = new Error('Registration failed');
      const result = userReducer(
        initialState,
        registerUser.rejected(error, '', mockUser)
      );
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Registration failed');
    });
  });

  describe('loginUser', () => {
    const mockLogin = { email: 'test@test.com', password: '123456' };

    it('should handle pending', () => {
      const result = userReducer(
        initialState,
        loginUser.pending('', mockLogin)
      );
      expect(result.isLoading).toBe(true);
    });

    it('should handle fulfilled', () => {
      const user = { email: 'test@test.com', name: 'Test User' };
      const payload: TAuthResponse = {
        success: true,
        user,
        accessToken: 'token',
        refreshToken: 'refresh'
      };
      const result = userReducer(
        initialState,
        loginUser.fulfilled(payload, '', mockLogin)
      );
      expect(result.isLoading).toBe(false);
      expect(result.user).toEqual(user);
      expect(result.isAuthChecked).toBe(true);
    });

    it('should handle rejected', () => {
      const error = new Error('Login failed');
      const result = userReducer(
        initialState,
        loginUser.rejected(error, '', mockLogin)
      );
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Login failed');
    });
  });

  describe('logout', () => {
    const stateWithUser = {
      ...initialState,
      user: { email: 'test@test.com', name: 'Test User' },
      isAuthChecked: true
    };

    it('should handle fulfilled', () => {
      const result = userReducer(stateWithUser, logout.fulfilled(true, ''));
      expect(result.user).toBeNull();
      expect(result.isAuthChecked).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('checkUser', () => {
    it('should handle fulfilled', () => {
      const user = { email: 'test@test.com', name: 'Test User' };
      const payload: TUserResponse = {
        success: true,
        user
      };
      const result = userReducer(
        initialState,
        checkUser.fulfilled(payload, '', undefined)
      );
      expect(result.isLoading).toBe(false);
      expect(result.user).toEqual(user);
      expect(result.isAuthChecked).toBe(true);
    });

    it('should handle rejected', () => {
      const result = userReducer(
        initialState,
        checkUser.rejected(new Error('Check failed'), '', undefined)
      );
      expect(result.isLoading).toBe(false);
      expect(result.user).toBeNull();
      expect(result.isAuthChecked).toBe(true);
    });
  });

  describe('updateUser', () => {
    const mockUpdate = {
      email: 'new@test.com',
      name: 'New Name',
      password: 'newpassword123'
    };

    it('should handle fulfilled', () => {
      const user = { email: 'new@test.com', name: 'New Name' };
      const payload: TUserResponse = {
        success: true,
        user
      };
      const result = userReducer(
        initialState,
        updateUser.fulfilled(payload, '', mockUpdate)
      );
      expect(result.isLoading).toBe(false);
      expect(result.user).toEqual(user);
      expect(result.isAuthChecked).toBe(true);
    });

    it('should handle rejected', () => {
      const error = new Error('Update failed');
      const result = userReducer(
        initialState,
        updateUser.rejected(error, '', mockUpdate)
      );
      expect(result.isLoading).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });
});
