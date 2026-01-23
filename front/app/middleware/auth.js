export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.client) {
    const token = localStorage.getItem("accessToken"); // o localStorage si prefieres
    const role = localStorage.getItem("user_role"); // 'admin' o 'profes'
    const currentRoute = to.path;

    // Si no hay token, redirige a login (excepto si ya estás en login)
    if (
      !token &&
      !currentRoute.includes("/forms/log-in") &&
      !currentRoute.includes("/forms/sign-up")
    ) {
      return navigateTo("/forms/log-in");
    }

    // Si eres admin pero intentas acceder a /profes
    if (role !== "Admin" && currentRoute.includes("/admin")) {
      return navigateTo("/centro/paginaPrincipal-Profes");
    }

    // Si eres profes pero intentas acceder a /admin
    if (role !== "Professorat" && currentRoute.includes("/centro")) {
      return navigateTo("/admin/paginaPrincipal-Admin");
    }
  }
});
