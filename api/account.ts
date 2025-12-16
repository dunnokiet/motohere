const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Account {
  id?: number;
  username?: string;
  email: string;
  phone: string;
  birthDate?: string;
}

export const getInformationAccount = async (accessToken: string | null) => {
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_URL}/managemention-account/user-information`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();
  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }

  const accountDetail: Account = result.data;

  return { accountDetail };
};

export const updateInformationAccount = async (account: Account, accessToken: string | null) => {
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_URL}/managemention-account/update-information`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(account),
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};

export const customerToOwner = async (id: number, accessToken: string | null) => {
  if (!accessToken) throw new Error('No access token');

  const response = await fetch(`${API_URL}/managemention-account/update-role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(id),
  });

  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result.message[0]);
  }
};
