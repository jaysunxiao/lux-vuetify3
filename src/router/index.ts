import {createRouter, createWebHistory} from "vue-router";
import ChartsRoutes from "./charts.routes";
import {useZpAuthStore} from "@/stores/zpAuthStorage";
import ZpRoutes from "./zp.routes";
import _ from "lodash";

export const routes = [
  {
    path: "/",
    name: "landing-home",
    component: () =>
      import(
        /* webpackChunkName: "landing-home" */ "@/views/zp/Home.vue"
        ),
    meta: {
    },
  },
  {
    path: "/dashboard",
    meta: {
      requiresAuth: true,
      layout: "landing",
    },
    component: () => import("@/views/pages/DashBoard.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "error",
    component: () =>
      import(/* webpackChunkName: "error" */ "@/views/errors/NotFoundPage.vue"),
  },
  ...ZpRoutes,
  ...ChartsRoutes,
];

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [];

const router = createRouter({
  history: createWebHistory(),
  // hash模式：createWebHashHistory，history模式：createWebHistory
  // process.env.NODE_ENV === "production"

  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return {top: 0};
    }
  },
});

router.beforeEach((to, from, next) => {
  if (routes.findIndex(it => it.path == to.path) < 0) {
    next();
    return;
  }
  if (to.path == "/") {
    next();
    return;
  }
  if (to.path == "/signin") {
    next();
    return;
  }
  const zpAuthStore = useZpAuthStore();
  // 验证权限
  const auth = zpAuthStore.token;
  if (_.isEmpty(auth)) {
    next({path: '/signin'});
    return;
  }
  next();
});

export default router;
