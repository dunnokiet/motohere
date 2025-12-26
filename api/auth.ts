const API_URL = process.env.EXPO_PUBLIC_API_URL!;

export interface User {
  userId: string;
  accessToken: string;
  refreshToken: string;
}

export const login = async (username: string, password: string): Promise<{ user: User }> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();
  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }

  return { user: result.data };
};

export const register = async (username: string, password: string): Promise<{ user: User }> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }

  return { user: result.data };
};

export const logout = async (freshToken: string): Promise<void> => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'x-token': freshToken,
    },
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};

export const changePassword = async (
  username: string,
  oldPassword: string,
  newPassword: string,
  accessToken: string | null
) => {
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ username, oldPassword, newPassword }),
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};

export const forgotPassword = async (email: string) => {
  await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
};

export const resetPassword = async (email: string, otp: number, newPassword: string) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};
