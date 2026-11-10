export function signOut() {
  localStorage.clear();
  sessionStorage.setItem("signed-out", "true");
  window.location.assign("/");
}
