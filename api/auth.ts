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
