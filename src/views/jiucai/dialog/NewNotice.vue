<script setup lang="ts">
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
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

const requestMessages = computed(() => {
  return _.join(newsStore.newNotices, "<hr>");
});

</script>
<template>
  <v-dialog transition="dialog-top-transition" width="60vw" v-model="myStore.newNoticeDialog">
    <template v-slot:default="{ isActive }">
      <v-card prepend-icon="mdi-newspaper-variant-outline">
        <template v-slot:title>
          最新消息汇总
        </template>
        <v-card-text>
          <md-preview v-model="requestMessages" editor-id="preview-only"/>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>
