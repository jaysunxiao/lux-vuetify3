<script setup lang="ts">
import 'md-editor-v3/lib/preview.css';
import {useMyStore} from "@/stores/myStore";
import {useDisplay} from "vuetify";
import {useSnackbarStore} from "@/stores/snackbarStore";
import {useCustomizeThemeStore} from "@/stores/customizeTheme";
import { Icon } from "@iconify/vue";

const {mobile, width, height} = useDisplay();
const myStore = useMyStore();
const customizeTheme = useCustomizeThemeStore();
const snackbarStore = useSnackbarStore();


</script>
<template>
  <v-dialog v-model="myStore.settingDialog" width="800">
    <v-card prepend-icon="mdi-cog-transfer-outline">
      <template v-slot:title>
        设置
      </template>
      <v-divider/>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols=2>
              <Icon width="30" icon="icon-park:broadcast-radio" />
            </v-col>
            <v-col class="py-0">
              <v-switch v-model="myStore.newsNotify" label="情报通知" hide-details color="teal" inset></v-switch>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols=2>
              <Icon width="30" icon="icon-park:volume-notice" />
            </v-col>
            <v-col class="py-0">
              <v-switch v-model="myStore.squareNotify" label="聊天通知" hide-details color="teal" inset></v-switch>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols=2>
              <Icon width="30" icon="fluent-emoji-flat:party-popper" />
            </v-col>
            <v-col class="py-0">
              <v-switch v-model="myStore.particles" label="粒子特效" hide-details color="teal" inset></v-switch>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              Attention: 情报和聊天通知需要按照下图的方式打开浏览器通知权限
              <v-img src="aa/image/browser-notify.png"/>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
