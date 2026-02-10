export function navigate(to: string) {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function isActiveRoute(pathname: string, route: string): boolean {
  if (route === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(route);
}
