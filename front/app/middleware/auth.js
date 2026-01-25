export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.client) {
    const token = localStorage.getItem("accessToken"); // o localStorage si prefieres
    const role = localStorage.getItem("user_role"); // 'admin' o 'profes'
    const currentRoute = to.path;

    // Permitir acceso público a /talleristes
    if (currentRoute.includes("/talleristes")) {
      return;
    }

    // Si no hay token, redirige a login
    if (!token) {
      return navigateTo("/");
    }

    // Si eres admin pero intentas acceder a /centro
    if (role !== "Admin" && currentRoute.includes("/admin")) {
      return navigateTo("/centro");
    }

    // Si eres profes pero intentas acceder a /admin
    if (role !== "Professorat" && currentRoute.includes("/centro")) {
      return navigateTo("/admin");
    }
  }
});
