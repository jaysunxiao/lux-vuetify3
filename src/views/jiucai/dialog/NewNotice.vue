<script setup lang="ts">
import { MdPreview, config } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import LinkAttr from 'markdown-it-link-attributes';
import _ from "lodash";
import {useNewsStore} from "@/stores/newsStore";
import {useMyStore} from "@/stores/myStore";
import {useDisplay} from "vuetify";
import {useSnackbarStore} from "@/stores/snackbarStore";
import { useCustomizeThemeStore } from "@/stores/customizeTheme";

const {mobile, width, height} = useDisplay();
const myStore = useMyStore();
const newsStore = useNewsStore();

const customizeTheme = useCustomizeThemeStore();
const snackbarStore = useSnackbarStore();

config({
  markdownItPlugins(plugins) {
    return [
      ...plugins,
      {
        type: 'linkAttr',
        plugin: LinkAttr,
        options: {
          matcher(href: string) {
            // 如果使用了markdown-it-anchor
            // 应该忽略标题头部的锚点链接
            return !href.startsWith('#');
          },
          attrs: {
            target: '_blank',
          },
        },
      },
    ];
  },
});

const requestMessages = computed(() => {
  return _.join(newsStore.newNotices.map(it => it.content), "<hr>");
});

</script>
<template>
  <v-dialog transition="dialog-top-transition" width="60vw" v-model="myStore.newNoticeDialog">
    <template v-slot:default="{ isActive }">
      <v-card prepend-icon="mdi-newspaper-variant-outline">
        <template v-slot:title>
          上帝视角
        </template>
        <v-card-text>
          <md-preview v-model="requestMessages" editor-id="preview-only"/>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>
