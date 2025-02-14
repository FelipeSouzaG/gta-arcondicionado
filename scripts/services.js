const apiUrl = 'https://servergta.vercel.app';

export function ErrorBase(
  msg = 'Falha na conexão com servidor. Verifique a internet ou tente novamente.'
) {
  const error = new Error(msg);
  return error;
}

export const userLogin = async (dataUser) => {
  try {
    const response = await fetch(`${apiUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dataUser),
    });
    const dataLogin = await response.json();
    return dataLogin;
  } catch (error) {
    throw ErrorBase();
  }
};

export const userRegister = async (data) => {
  try {
    const response = await fetch(`${apiUrl}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const dataRegister = await response.json();
    return dataRegister;
  } catch (error) {
    throw ErrorBase();
  }
};

export const userSection = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/users/userdata`, {
      method: 'GET',
      credentials: 'include',
    });
    const dataSection = await response.json();
    return dataSection;
  } catch (error) {
    throw ErrorBase();
  }
};

export const userLogoff = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/users/logoff`, {
      method: 'POST',
      credentials: 'include',
    });
    const dataLogoff = await response.json();
    return dataLogoff;
  } catch (error) {
    throw ErrorBase();
  }
};

export const userUpdate = async (data) => {
  try {
    const response = await fetch(`${apiUrl}/api/users/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const dataUpdate = await response.json();
    return dataUpdate;
  } catch (error) {
    throw ErrorBase();
  }
};

export const userDelete = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/users/delete`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const dataLogoff = await response.json();
    return dataLogoff;
  } catch (error) {
    throw ErrorBase();
  }
};

export const registerClient = async (data) => {
  try {
    const response = await fetch(`${apiUrl}/api/clients/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const dataClient = await response.json();
    return dataClient;
  } catch (error) {
    throw ErrorBase();
  }
};

export const clientUpdate = async (data, clientId) => {
  try {
    const response = await fetch(`${apiUrl}/api/clients/update/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const dataUpdate = await response.json();
    return dataUpdate;
  } catch (error) {
    throw ErrorBase();
  }
};

export const dataClient = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/clients/user`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw ErrorBase();
  }
};

export const registerAddress = async (data) => {
  try {
    const response = await fetch(`${apiUrl}/api/addresses/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const dataAddresses = await response.json();
    return dataAddresses;
  } catch (error) {
    throw ErrorBase();
  }
};

export const userAddress = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/addresses/client`, {
      method: 'GET',
      credentials: 'include',
    });
    const dataAddresses = await response.json();
    return dataAddresses;
  } catch (error) {
    throw ErrorBase();
  }
};

export const registerRequest = async (data) => {
  try {
    const response = await fetch(`${apiUrl}/api/requests/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const dataRequest = await response.json();
    return dataRequest;
  } catch (error) {
    throw ErrorBase();
  }
};

export const userRequest = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/requests/client`, {
      method: 'GET',
      credentials: 'include',
    });
    const dataRequest = await response.json();
    return dataRequest;
  } catch (error) {
    throw ErrorBase();
  }
};

export const getBudget = async (budgetId) => {
  try {
    const response = await fetch(`${apiUrl}/api/budgets/client/${budgetId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const dataBudget = await response.json();
    return dataBudget;
  } catch (error) {
    throw ErrorBase();
  }
};

export const updateBudgetClient = async (data, budgetId) => {
  try {
    const response = await fetch(
      `${apiUrl}/api/budgets/update/client/${budgetId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      }
    );
    const dataUpdate = await response.json();
    return dataUpdate;
  } catch (error) {
    throw ErrorBase();
  }
};
