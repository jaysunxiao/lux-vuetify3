import {defineStore} from "pinia";
import _ from "lodash";
import {newNotify} from "@/utils/notifyUtils";

const newNewsTimeout = 3 * 60 * 1000;
const myAvatarDefault = avatarAutoUrl(1);
const aiAvatarDefault = avatarAutoUrl(2);
const aiAvatar2Default = avatarAutoUrl(3);

class NewNotice {
  source: string;
  title: string;
  url: string;
  ctime: number;

  constructor(source: string, title: string, url: string, ctime: number) {
    this.source = source;
    this.title = title;
    this.url = url;
    this.ctime = ctime;
  }
}

class NewsLevel {
  value: number;
  type: string;
  icon: string;
  color: string;
  size: string;

  constructor(value: number, type: string, icon: string, color: string, size: string) {
    this.value = value;
    this.type = type;
    this.icon = icon;
    this.color = color;
    this.size = size;
  }
}

export const levelMap = new Map<number, NewsLevel>();
levelMap[1] = new NewsLevel(1, "S", "mdi-alpha-s-circle-outline", "error", "x-large");
levelMap[2] = new NewsLevel(2, "A", "mdi-alpha-a-circle-outline", "warning", "large");
levelMap[3] = new NewsLevel(3, "B", "mdi-alpha-b-circle-outline", "success", "default");
levelMap[4] = new NewsLevel(4, "C", "mdi-alpha-c-circle-outline", "info", "small");
levelMap[5] = new NewsLevel(5, "D", "mdi-alpha-d-circle-outline", "blue-grey", "x-small");

export function avatarAutoUrl(id: number): string {
  const avatarId = id % 800 + 1;
  const avatar = import.meta.env.VITE_BASE_HTTP_URL + "/ab/" + avatarId + ".jpg";
  return avatar;
}

export const useNewsStore = defineStore("newsStore", {
  state: () => ({
    newsInfos: [],
    newsLevelFilter: "D",
    newsLevelFilterValue: 5,
    chatMessageId: 0,

    newNotices: new Array<NewNotice>,
    online: false,
    ip: "local",
    region: "",
    ipLong: 0,
    sid: 0,
    activeUid: 0,
    chatMessageIdDiff: 0,
    newsSearchDialog: false,
    newNoticeDialog: false,
  }),

  persist: {
    enabled: true,
    strategies: [{storage: localStorage, paths: ["newsInfos", "newsLevelFilter", "newsLevelFilterValue", "chatMessageId"]}],
  },

  getters: {},

  actions: {
    isNew(id: number): boolean {
      const index = _.findIndex(this.newsInfos, it => it.id == id);
      if (index >= 0) {
        const news = this.newsInfos[index];
        if (new Date().getTime() - news.time < newNewsTimeout) {
          return true;
        } else {
          return false;
        }
      }

      if (this.newsInfos.length >= 500) {
        this.newsInfos = _.drop(this.newsInfos, 100);
      }

      this.newsInfos.push({
        id: id,
        time: new Date().getTime()
      });
      return true;
    },

    updateNewsLevelFilter(level: string, value: number) {
      this.newsLevelFilter = level;
      this.newsLevelFilterValue = value;
    },

    myAvatar(): string {
      return this.ipLong == 0 ? myAvatarDefault : avatarAutoUrl(this.ipLong);
    },
    aiAvatar(): string {
      return this.ipLong == 0 ? aiAvatarDefault : avatarAutoUrl(this.ipLong + 1);
    },
    aiAvatar2(): string {
      return this.ipLong == 0 ? aiAvatar2Default : avatarAutoUrl(this.ipLong + 2);
    },

    getMaxNewsId(): number {
      if (_.isEmpty(this.newsInfos)) {
        return 0;
      }
      return _.maxBy(this.newsInfos, it => it.id).id;
    },

    addNewNotice(source: string, title: string, url: string, ctime: number, ) {
      // 主要是过滤研报，研报的排名会经常的变动
      if (new Date().getTime() - ctime >  1 * 24 * 60 * 60 * 1000) {
        return;
      }
      if (this.newNotices.findIndex(it => it.url == url) >= 0) {
        return;
      }
      const newNotice = new NewNotice(source, title, url, ctime);
      const array = [newNotice];
      this.newNotices = _.sortBy(_.concat(array, this.newNotices), it => -it.ctime);
      if (this.newNotices.length > 512) {
        this.newNotices = _.drop(this.newNotices, 128);
      }
      newNotify(source, title);
      this.newNoticeDialog = true;
    }
  }
});
