export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.client) {
    const token = localStorage.getItem("accessToken"); // o localStorage si prefieres
    const role = localStorage.getItem("user_role"); // 'admin' o 'profes'
    const currentRoute = to.path;

    // Si no hay token, redirige a login (excepto si ya estás en login)
    if (
      !token &&
      !currentRoute.includes("/") &&
      !currentRoute.includes("/sign-up")
    ) {
      return navigateTo("/");
    }

    // Si eres admin pero intentas acceder a /profes
    if (role !== "Admin" && currentRoute.includes("/admin")) {
      return navigateTo("/centro");
    }

    // Si eres profes pero intentas acceder a /admin
    if (role !== "Professorat" && currentRoute.includes("/centro")) {
      return navigateTo("/admin");
    }
  }
});
