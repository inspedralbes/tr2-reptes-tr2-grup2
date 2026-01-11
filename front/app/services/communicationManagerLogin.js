const BACK_URL = import.meta.env.VITE_URL_BACK;

// Refresh acces token
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    const response = await fetch(`${BACK_URL}/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }

    const data = await response.json();

    // Guardar el nuevo token
    useAppStore().setAccessToken(data.accessToken);
    localStorage.setItem("accessToken", data.accessToken);

    return data;
  } catch (error) {
    console.error("Error al renovar el Access Token:", error);
    window.location.href = "/login";
    return { error: "Error al renovar el Access Token." };
  }
};

// Login API firebase
export const loginAPI = async (user) => {
  try {
    const response = await fetch(`${BACK_URL}/loginAPI`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error("Network error:", error);
    return { error: "Network error. Please try again later." };
  }
};

// Login with my app
export const loginDB = async (user) => {
  try {
    const response = await fetch(`${BACK_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error("Network error:", error);
    return { error: "Network error. Please try again later." };
  }
};

// Refresh Login
export const getUserForRefreshLogin = async (user) => {
  try {
    const response = await fetch(
      `${BACK_URL}/user?email=${encodeURIComponent(user.email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Enviar token en los headers
        },
      }
    );

    if (response.status == 401) {
      const refreshResult = await refreshToken();

      if (refreshResult.error) {
        return {
          error: "No se pudo renovar el token. Inicia sesión nuevamente.",
        };
      }

      return getUserForRefreshLogin(user);
    }

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    console.error("Network error:", error);
    return { error: "Network error. Please try again later." };
  }
};

// Logout for my app
export const logout = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${BACK_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ accessToken, refreshToken }),
    });

    if (response.status === 401) {
      const refreshResult = await refreshToken();

      if (refreshResult.error) {
        return {
          error: "No se pudo renovar el token. Inicia sesión nuevamente.",
        };
      }

      // Reintenta el logout después de renovar el token
      return await logout();
    }

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }

    // Clear Pinia store
    const appStore = useAppStore();
    appStore.$reset();

    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    return { message: "Logout successful" };
  } catch (error) {
    console.error("Network error:", error);
    return { error: "Network error. Please try again later." };
  }
};
