import { authApi } from './authApi';
import api from '../../../services/api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../../../types/auth';

// axiosのモック
jest.mock('../../../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  is_active: true,
  is_admin: false,
  email_verified: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockAuthResponse: AuthResponse = {
  access_token: 'test-token',
  token_type: 'bearer',
  user: mockUser,
};

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('ユーザー登録が正常に動作する', async () => {
      const registerData: RegisterData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      };

      mockedApi.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await authApi.register(registerData);

      expect(mockedApi.post).toHaveBeenCalledWith('/users/register', registerData);
      expect(result).toEqual(mockAuthResponse);
    });

    it('ユーザー登録でエラーが発生した場合はエラーを再投出する', async () => {
      const registerData: RegisterData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
      };

      const error = new Error('Registration failed');
      mockedApi.post.mockRejectedValue(error);

      await expect(authApi.register(registerData)).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    it('ログインが正常に動作する', async () => {
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'password123',
      };

      mockedApi.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await authApi.login(credentials);

      // FormDataが正しく作成されて送信されることを確認
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/users/login',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // FormDataの内容を確認
      const formDataCall = mockedApi.post.mock.calls[0][1] as FormData;
      expect(formDataCall.get('username')).toBe('testuser');
      expect(formDataCall.get('password')).toBe('password123');

      expect(result).toEqual(mockAuthResponse);
    });

    it('ログインでエラーが発生した場合はエラーを再投出する', async () => {
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockedApi.post.mockRejectedValue(error);

      await expect(authApi.login(credentials)).rejects.toThrow('Invalid credentials');
    });

    it('空のパスワードでもFormDataが正しく作成される', async () => {
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: '',
      };

      mockedApi.post.mockResolvedValue({ data: mockAuthResponse });

      await authApi.login(credentials);

      const formDataCall = mockedApi.post.mock.calls[0][1] as FormData;
      expect(formDataCall.get('username')).toBe('testuser');
      expect(formDataCall.get('password')).toBe('');
    });
  });

  describe('getCurrentUser', () => {
    it('現在のユーザー情報の取得が正常に動作する', async () => {
      mockedApi.get.mockResolvedValue({ data: mockUser });

      const result = await authApi.getCurrentUser();

      expect(mockedApi.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUser);
    });

    it('ユーザー情報取得でエラーが発生した場合はエラーを再投出する', async () => {
      const error = new Error('Unauthorized');
      mockedApi.get.mockRejectedValue(error);

      await expect(authApi.getCurrentUser()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateUser', () => {
    it('ユーザー情報の更新が正常に動作する', async () => {
      const updateData = {
        email: 'newemail@example.com',
      };

      const updatedUser: User = {
        ...mockUser,
        email: 'newemail@example.com',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockedApi.put.mockResolvedValue({ data: updatedUser });

      const result = await authApi.updateUser(updateData);

      expect(mockedApi.put).toHaveBeenCalledWith('/users/me', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('複数のフィールドを同時に更新できる', async () => {
      const updateData = {
        username: 'newusername',
        email: 'newemail@example.com',
      };

      mockedApi.put.mockResolvedValue({ data: mockUser });

      await authApi.updateUser(updateData);

      expect(mockedApi.put).toHaveBeenCalledWith('/users/me', updateData);
    });

    it('ユーザー情報更新でエラーが発生した場合はエラーを再投出する', async () => {
      const updateData = {
        email: 'invalid-email',
      };

      const error = new Error('Validation failed');
      mockedApi.put.mockRejectedValue(error);

      await expect(authApi.updateUser(updateData)).rejects.toThrow('Validation failed');
    });
  });

  describe('deleteAccount', () => {
    it('アカウント削除が正常に動作する', async () => {
      mockedApi.delete.mockResolvedValue({});

      await authApi.deleteAccount();

      expect(mockedApi.delete).toHaveBeenCalledWith('/users/me');
    });

    it('アカウント削除でエラーが発生した場合はエラーを再投出する', async () => {
      const error = new Error('Deletion failed');
      mockedApi.delete.mockRejectedValue(error);

      await expect(authApi.deleteAccount()).rejects.toThrow('Deletion failed');
    });
  });

  describe('その他のエッジケース', () => {
    it('特殊文字を含むユーザー名でログインできる', async () => {
      const credentials: LoginCredentials = {
        username: 'user@domain.com',
        password: 'password123',
      };

      mockedApi.post.mockResolvedValue({ data: mockAuthResponse });

      await authApi.login(credentials);

      const formDataCall = mockedApi.post.mock.calls[0][1] as FormData;
      expect(formDataCall.get('username')).toBe('user@domain.com');
    });

    it('長いパスワードでログインできる', async () => {
      const longPassword = 'a'.repeat(1000);
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: longPassword,
      };

      mockedApi.post.mockResolvedValue({ data: mockAuthResponse });

      await authApi.login(credentials);

      const formDataCall = mockedApi.post.mock.calls[0][1] as FormData;
      expect(formDataCall.get('password')).toBe(longPassword);
    });

    it('空のオブジェクトでユーザー情報を更新できる', async () => {
      mockedApi.put.mockResolvedValue({ data: mockUser });

      await authApi.updateUser({});

      expect(mockedApi.put).toHaveBeenCalledWith('/users/me', {});
    });
  });
});