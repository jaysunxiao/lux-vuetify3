<script setup lang="ts">
import _ from "lodash";
import {useNewsStore} from "@/stores/newsStore";
import {useMyStore} from "@/stores/myStore";
import {useDisplay} from "vuetify";
import {parseTime, formatTimeAgo} from "@/utils/timeUtils";
import {randomQuoteWithWebSite} from "@/utils/quoteUtils";
import clipboard from "@/utils/clipboardUtils";

const {mobile, width, height} = useDisplay();
const myStore = useMyStore();
const newsStore = useNewsStore();

async function copy(title: string, subTitle: string, ctime: number, url: string, event: Event) {
  let str = title + " - " + subTitle + " - " + parseTime(ctime) + "\n\n";
  if (!_.isEmpty(url)) {
    str = str + url + "\n\n";
  }
  str = str + randomQuoteWithWebSite();
  clipboard(str, event);
  snackbarStore.showSuccessMessage("复制成功");
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
                信源
              </th>
              <th>
                内容
              </th>
              <th>
                时间
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(newNotice, i) in newsStore.newNotices" :key="i" class="cursor-pointer" v-ripple @click="copy(newNotice.title, newNotice.subTitle, newNotice.ctime, newNotice.url, $event)">
              <td>
                {{ newNotice.title }}
              </td>
              <td v-if="_.isEmpty(newNotice.url)">
                <a :href="newNotice.url" referrerPolicy="no-referrer" target="_blank">{{ newNotice.subTitle }}</a>
              </td>
              <td v-else>
                {{ newNotice.subTitle }}
              </td>
              <td>
                {{ formatTimeAgo(newNotice.ctime) }}
              </td>
            </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </template>
  </v-dialog>
</template>
