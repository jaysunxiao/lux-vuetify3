<template>
  <v-app :theme="customizeTheme.darkTheme ? 'dark' : 'light'">
    <component :is="currentLayout" v-if="isRouterLoaded">
      <router-view> </router-view>
    </component>
<!--    <BackToTop />-->
    <Snackbar />
    <Announcement />
    <NewNotice />
    <RewardTip />
    <WeChatLogin />
    <BrowserNotify />
    <Profile />
    <Setting />
    <NewsSearch />
    <Admin />
    <Particle />
  </v-app>
</template>

<script setup lang="ts">
import UILayout from "@/layouts/UILayout.vue";
import LandingLayout from "@/layouts/LandingLayout.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import AuthLayout from "@/layouts/AuthLayout.vue";
import { useCustomizeThemeStore } from "@/stores/customizeTheme";
// import BackToTop from "@/components/common/BackToTop.vue";
import Snackbar from "@/components/common/Snackbar.vue";
import Announcement from "@/views/jiucai/dialog/Announcement.vue";
import NewNotice from "@/views/jiucai/dialog/NewNotice.vue";
import RewardTip from "@/views/jiucai/dialog/RewardTip.vue";
import WeChatLogin from "@/views/jiucai/dialog/WeChatLogin.vue";
import BrowserNotify from "@/views/jiucai/dialog/BrowserNotify.vue";
import Profile from "@/views/jiucai/dialog/Profile.vue";
import Setting from "@/views/jiucai/dialog/Setting.vue";
import NewsSearch from "@/views/jiucai/dialog/NewsSearch.vue";
import Admin from "@/views/jiucai/dialog/Admin.vue";
import Particle from "@/views/jiucai/common/Particle.vue";

const customizeTheme = useCustomizeThemeStore();
const route = useRoute();

const isRouterLoaded = computed(() => {
  if (route.name !== null) return true;
  return false;
});

const layouts = {
  default: DefaultLayout,
  ui: UILayout,
  landing: LandingLayout,
  auth: AuthLayout,
};

type LayoutName = "default" | "ui" | "landing" | "auth" | "error";

const currentLayout = computed(() => {
  const layoutName = route.meta.layout as LayoutName;
  if (!layoutName) {
    return DefaultLayout;
  }
  return layouts[layoutName];
});
</script>

<style scoped></style>
