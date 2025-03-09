import {defineStore} from "pinia";
import _ from "lodash";

const newNewsTimeout = 3 * 60 * 1000;
const myAvatarDefault = avatarAutoUrl(1);
const aiAvatarDefault = avatarAutoUrl(2);
const aiAvatar2Default = avatarAutoUrl(3);

export const levelMap = {
  "S": {
    value: 1,
    icon: "mdi-alpha-s-circle-outline",
    color: "error",
    size: "x-large"
  },
  "A": {
    value: 2,
    icon: "mdi-alpha-a-circle-outline",
    color: "warning",
    size: "large"
  },
  "B": {
    value: 3,
    icon: "mdi-alpha-b-circle-outline",
    color: "success",
    size: "default"
  },
  "C": {
    value: 4,
    icon: "mdi-alpha-c-circle-outline",
    color: "info",
    size: "small"
  },
  "D": {
    value: 5,
    icon: "mdi-alpha-d-circle-outline",
    color: "blue-grey",
    size: "x-small"
  },
};

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

    newNotices: [],
    online: false,
    ip: "local",
    region: "",
    ipLong: 0,
    sid: 0,
    activeUid: 0,
    chatMessageIdDiff: 0,
    newsSearchDialog: false,
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

    addNewNotice(title: string, subTitle: string, ctime: number, url: string) {
      const array = [{
        title: title,
        subTitle: subTitle,
        ctime: ctime,
        url: url
      }];
      this.newNotices = _.sortBy(_.concat(array, this.newNotices), it => -it.ctime);
      if (this.newNotices.length > 30) {
        this.newNotices = _.drop(this.newNotices, 10);
      }
    }
  }
});
