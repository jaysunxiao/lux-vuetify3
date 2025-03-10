<script setup lang="ts">
import _ from "lodash";
import {useNewsStore} from "@/stores/newsStore";
import {useMyStore} from "@/stores/myStore";
import {useSnackbarStore} from "@/stores/snackbarStore";
import {useDisplay} from "vuetify";
import {parseTime, formatTimeAgo} from "@/utils/timeUtils";

const {mobile, width, height} = useDisplay();
const myStore = useMyStore();
const newsStore = useNewsStore();
const snackbarStore = useSnackbarStore();

const NEW_NOTICE_TIME = 3 * 60 * 60 * 1000;

function newNoticeClass(ctime) {
  return new Date().getTime() - ctime < NEW_NOTICE_TIME ? 'font-weight-black' : '';
}

</script>

<template>
  <v-dialog transition="dialog-top-transition" width="60vw" v-model="myStore.newNoticeDialog">
    <template v-slot:default="{ isActive }">
      <v-card prepend-icon="mdi-newspaper-variant-outline">
        <template v-slot:title>
          情报聚合
        </template>
        <v-card-text>
          <v-table density="compact">
            <thead>
            <tr>
              <th>
                时间
              </th>
              <th>
                信源
              </th>
              <th>
                内容
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(newNotice, i) in _.take(newsStore.newNotices, 30)" :key="i" v-ripple>
              <td>
                {{ formatTimeAgo(newNotice.ctime) }}
              </td>
              <td>
                {{ _.truncate(newNotice.source) }}
              </td>
              <td v-if="_.isEmpty(newNotice.url)" :class="newNoticeClass(newNotice.ctime)">
                {{ newNotice.title }}
              </td>
              <td v-else :class="newNoticeClass(newNotice.ctime)">
                <a :href="newNotice.url" referrerPolicy="no-referrer" target="_blank">{{ newNotice.title }}</a>
              </td>
            </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>
