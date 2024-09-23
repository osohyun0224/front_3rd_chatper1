import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";

import Store from "./utils/store";

const routes = {
  '/': HomePage,
  '/profile': ProfilePage,
  '/login': LoginPage,
  '/404': NotFoundPage,
};

const rootElementId = 'root';

function createRouter(routesConfig = routes, rootElement = rootElementId) {
  const userStore = Store();

  function protectRoute(path) {
    const isLoggedIn = userStore.getState('isLoggedIn');
    if (path === '/profile' && !isLoggedIn) return '/login';
    if (path === '/login' && isLoggedIn) return '/';
    return path;
  }

  function renderComponent(path) {
    const component = routesConfig[path] || routesConfig['/404'];
    const rootElement = document.getElementById(rootElementId);
    if (rootElement) {
      rootElement.innerHTML = component();
    }
  }

  function navigate(path) {
    const protectedPath = protectRoute(path);
    renderComponent(protectedPath);
    history.pushState(null, null, protectedPath);

    if (typeof routesConfig[protectedPath] === 'function') {
      routesConfig[protectedPath]();
    }
  }

  function handlePopState() {
    const path = window.location.pathname;
    navigate(path);
  }

  function handleLinkClick(event) {
    const target = event.target;
/* 이벤트 위임으로 구현한 함수 */
//프로젝트 전체에 클릭 이벤트 리스너를 설정하고, 이벤트가 발생하면 이벤트 타겟이 링크(A 태그)인지 확인
    if (target.tagName === 'A' && target.href.startsWith(window.location.origin)) {
      event.preventDefault();

      if (target.id === 'logout') {
        userStore.clearUserInfo();
        navigate('/login');
        return;
      }

      const href = target.getAttribute('href');
      if (href) {
        navigate(href);
      }
    }
  }

  function init() {
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleLinkClick);
    navigate(window.location.pathname || '/');
  }

  return {
    navigate,
    init,
  };
}

const Router = createRouter();

export default Router;
