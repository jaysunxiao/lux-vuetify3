<script setup lang="ts">
import {asyncAsk, isWebsocketReady} from "@/utils/websocket";
import AnimationLeek1 from "@/animation/AnimationLeek1.vue";
import News from "@/protocol/news/News";
import NewsRequest from "@/protocol/news/NewsRequest";
import NewsResponse from "@/protocol/news/NewsResponse";
import NewsLoadMoreRequest from "@/protocol/news/NewsLoadMoreRequest";
import NewsLoadMoreResponse from "@/protocol/news/NewsLoadMoreResponse";
import Concept from "@/protocol/concept/Concept";
import ConceptRequest from "@/protocol/concept/ConceptRequest";
import ConceptResponse from "@/protocol/concept/ConceptResponse";
import EastMoneyUSRank from "@/protocol/rank/EastMoneyUSRank";
import EastMoneyRank from "@/protocol/rank/EastMoneyRank";
import RankRequest from "@/protocol/rank/RankRequest";
import RankResponse from "@/protocol/rank/RankResponse";
import MarketRequest from "@/protocol/stock/MarketRequest";
import MarketResponse from "@/protocol/stock/MarketResponse";
import Trending from "@/protocol/trending/Trending";
import TrendingRequest from "@/protocol/trending/TrendingRequest";
import TrendingResponse from "@/protocol/trending/TrendingResponse";
import _ from "lodash";
import {useDisplay} from "vuetify";
import clipboard from "@/utils/clipboardUtils";
import {useSnackbarStore} from "@/stores/snackbarStore";
import {useMyStore} from "@/stores/myStore";
import {useNewsStore, levelMap} from "@/stores/newsStore";
import {parseTime, formatTimeAgo, getFormatMonth, formatTimestampMMDDHHMM, formatTimestampYYYYMMDDHHMM} from "@/utils/timeUtils";
import {randomEmotion, randomQuoteWithWebSite} from "@/utils/quoteUtils";
import Chart from 'chart.js/auto';

const snackbarStore = useSnackbarStore();
const newsStore = useNewsStore();
const myStore = useMyStore();
const {mobile, width, height} = useDisplay();

const NEW_CONCEPT_TIME = 33 * 24 * 60 * 60 * 1000;
const NEW_TRENDING_TIME = 1 * 24 * 60 * 60 * 1000;


const newsRef = ref<News[]>([]);
const conceptsRef = ref<Concept[]>([]);
const eastMoneyUSRanksRef = ref<EastMoneyUSRank[]>([]);
const eastMoneyRanksRef = ref<EastMoneyRank[]>([]);
const conceptCoreRef = ref<string>('');
const rankCoreCoreRef = ref<string>('');
const douyinTrendingRef = ref<Trending[]>([]);
const xueqiuTrendingRef = ref<Trending[]>([]);
const dfcfTrendingRef = ref<Trending[]>([]);
const bloomBergTrendingRef = ref<Trending[]>([]);
const reutersTrendingRef = ref<Trending[]>([]);
const loadingRef = ref(true);
const floatingButtonRef = ref(false);
let endId = -1;
let startId = -1;


onMounted(() => {
  console.log("news on mounted-----------------------------------------");
  init();
  setInterval(() => requestNews(), 15 * 1000);
  setInterval(() => requestRanks(100), 10 * 60 * 1000);
  setInterval(() => requestConcepts(27), 30 * 60 * 1000);
  setInterval(() => requestTrending(), 8 * 60 * 1000);
});

watch(
  () => newsStore.newsLevelFilterValue,
  async (val) => {
    init();
  },
  {
    deep: true,
  }
);

watch(
  () => newsStore.marketIndex,
  async (val) => {
    setTimeout(() => requestMarkets(), 300);
  }
);

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    requestNews();
  }
});

function init() {
  if (!isWebsocketReady()) {
    setTimeout(() => {
      init();
    }, 100);
    return;
  }

  doInitNews();
  requestConcepts(27);
  requestRanks(100);
  requestTrending();
  if (!mobile.value) {
    requestMarkets();
  }
}

async function doInitNews() {
  const request = new NewsRequest();
  request.endId = -1;
  request.level = newsStore.newsLevelFilterValue;
  console.log("news init ----------------------------------------");
  const response: NewsResponse = await asyncAsk(request);
  loadingRef.value = false;
  newsRef.value = response.news;
  startId = _.last(response.news).id;
  endId = response.endId;
  snackbarStore.showSuccessMessage("情报初始化成功");
}

async function requestNews() {
  if (endId < 0) {
    return;
  }
  const request = new NewsRequest();
  request.endId = endId;
  request.level = newsStore.newsLevelFilterValue;
  const response: NewsResponse = await asyncAsk(request);
  console.log("news request response ----------------------------------");
  if (response.endId == endId) {
    return;
  }
  newNoticeNews(response.news);
  const newNews = _.concat(response.news, newsRef.value);
  newsRef.value = newNews;
  endId = response.endId;
}

function newNoticeNews(news: Array<News>) {
  const first = _.first(news.filter(it => it.level == 1 || it.level == 2).filter(it => newsStore.isNew(it.id)));
  if (!isNewNoticeEnable() || _.isEmpty(first)) {
    return;
  }
  if (myStore.newsNotify && !mobile.value) {
    const levelType = levelMap[first.level].type;
    const title = _.isEmpty(first.title) ? first.content : first.title;
    newsStore.addNewNotice(`${levelType}级情报`, title, `https://jiucai.fun/ac/${first.id}`, first.ctime);
  }
}

async function loadMoreNews() {
  loadingRef.value = true;
  const request = new NewsLoadMoreRequest();
  request.startId = startId;
  request.level = newsStore.newsLevelFilterValue;
  console.log("news loadMore --------------------------------------");
  const response: NewsLoadMoreResponse = await asyncAsk(request)
  loadingRef.value = false;
  if (_.isEmpty(response.news)) {
    snackbarStore.showErrorMessage("没有更多了");
    return;
  }
  const newNews = _.concat(newsRef.value, response.news);
  newsRef.value = newNews;
  startId = response.startId;
}


// ---------------------------------------------------------------------------------------------------------------------

async function requestConcepts(num: number, notice: boolean = false) {
  const request = new ConceptRequest();
  request.num = num;
  const response: ConceptResponse = await asyncAsk(request)
  conceptsRef.value = response.concepts;
  conceptCoreRef.value = response.core;
  if (notice) {
    snackbarStore.showSuccessMessage("加载了更多的新概念");
  }
  newNoticeConcepts(conceptsRef.value, response.concepts);
}

async function requestRanks(num: number) {
  const request = new RankRequest();
  request.num = num;
  const response: RankResponse = await asyncAsk(request)
  eastMoneyUSRanksRef.value = response.usRanks;
  eastMoneyRanksRef.value = response.ranks;
  rankCoreCoreRef.value = response.core;
}

async function requestTrending() {
  const request = new TrendingRequest();
  const response: TrendingResponse = await asyncAsk(request)
  douyinTrendingRef.value = response.douyin;

  newNoticeTrendingWithSource(dfcfTrendingRef.value, response.dfcf2, "研报");
  dfcfTrendingRef.value = response.dfcf2;
  newNoticeTrendingWithSourceAndSubTitle(bloomBergTrendingRef.value, response.bloomBerg, "彭博社");
  bloomBergTrendingRef.value = response.bloomBerg;
  newNoticeTrendingWithSourceAndSubTitle(reutersTrendingRef.value, response.reuters, "路透社");
  reutersTrendingRef.value = response.reuters;
  response.xueqiu.forEach(it => it.subTitle = "雪球");
  newNoticeTrending(xueqiuTrendingRef.value, response.xueqiu);
  newNoticeTrending(xueqiuTrendingRef.value, response.dfcf1);
  xueqiuTrendingRef.value = _.sortBy(_.concat(response.xueqiu, response.dfcf1), it => -it.ctime);
}

function isNewNoticeEnable() {
  return myStore.newsNotify && !mobile.value
}

function newNoticeConcepts(oldConcepts: Array<Concept>, newConcepts: Array<Concept>) {
  if (!isNewNoticeEnable() || _.isEmpty(oldConcepts)) {
    return;
  }

  for (const concept of newConcepts) {
    if (oldConcepts.findIndex(it => it.url == concept.url) >= 0) {
      continue;
    }

    newsStore.addNewNotice(concept.title, concept.content, concept.url, concept.ctime);
  }
}

function newNoticeTrending(oldTrending: Array<Trending>, newTrending: Array<Trending>) {
  if (!isNewNoticeEnable() || _.isEmpty(oldTrending)) {
    return;
  }

  for (const trending of newTrending) {
    if (oldTrending.findIndex(it => it.url == trending.url) >= 0) {
      continue;
    }

    newsStore.addNewNotice(trending.subTitle, trending.title,  trending.url, trending.ctime);
  }
}

function newNoticeTrendingWithSource(oldTrending: Array<Trending>, newTrending: Array<Trending>, source: string) {
  if (!isNewNoticeEnable() || _.isEmpty(oldTrending)) {
    return;
  }

  for (const trending of newTrending) {
    if (oldTrending.findIndex(it => it.url == trending.url) >= 0) {
      continue;
    }

    const title = _.isEmpty(trending.subTitle) ? trending.title : (trending.title + "-" + trending.subTitle);
    newsStore.addNewNotice(source, title,  trending.url, trending.ctime);
  }
}

function newNoticeTrendingWithSourceAndSubTitle(oldTrending: Array<Trending>, newTrending: Array<Trending>, source: string) {
  if (!isNewNoticeEnable() || _.isEmpty(oldTrending)) {
    return;
  }

  for (const trending of newTrending) {
    if (oldTrending.findIndex(it => it.url == trending.url) >= 0) {
      continue;
    }

    newsStore.addNewNotice(source, trending.subTitle,  trending.url, trending.ctime);
  }
}

// ---------------------------------------------------------------------------------------------------------------------
var lastRequestMarketNum = 0;
async function requestMarkets() {
  console.log(`request markets ${lastRequestMarketNum} -> ${newsStore.marketIndex}`);
  if (lastRequestMarketNum == newsStore.marketIndex) {
    return;
  }
  const request = new MarketRequest();
  request.num = newsStore.marketIndex;
  const response: MarketResponse = await asyncAsk(request);
  lastRequestMarketNum = newsStore.marketIndex;
  const firstMarket = _.first(response.markets);
  const shMarketIndex = firstMarket?.shMarketIndex / 100;
  const marketIndexRatio = firstMarket?.marketIndex / shMarketIndex;
  const kcMarketIndexRatio = firstMarket?.kcMarketIndex / shMarketIndex;
  const szMarketIndexRatio = firstMarket?.szMarketIndex / shMarketIndex;
  const cyMarketIndexRatio = firstMarket?.cyMarketIndex / shMarketIndex;
  const bjMarketIndexRatio = firstMarket?.bjMarketIndex / shMarketIndex;
  const exchangeIndexRatio = firstMarket?.exchange / shMarketIndex;
  Chart.getChart("indexChart")?.destroy()
  Chart.getChart("exchangeChart")?.destroy()

  new Chart(document.getElementById('indexChart'), {
    options: {
      responsive: true,
      animations: {
        tension: {
          duration: 1000,
          easing: 'linear',
          from: 0,
          to: 0.3,
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const y = _.ceil(context.parsed.y, 2);
              const currentRawValue = context.dataset.rawData[context.dataIndex];
              const currentRawValueCeil = _.ceil(currentRawValue / 10000, 2);
              if (context.dataIndex == 0) {
                return `${context.dataset.label}:${y} / 总流通市值:${currentRawValueCeil}万亿`;
              }
              const lastRawValue = context.dataset.rawData[context.dataIndex - 1];
              const riseRawCeil = _.ceil((currentRawValue - lastRawValue))

              const lastValue = context.dataset.data[context.dataIndex - 1];
              const rise = _.ceil((context.parsed.y - lastValue) / lastValue * 100, 2);
              if (context.dataset.exchange) {
                const result = riseRawCeil > 0
                  ? `${context.dataset.label}:${y} / 成交量:${currentRawValueCeil}万亿 / 增加:${riseRawCeil}亿 / 涨跌幅:${rise}%`
                  : `${context.dataset.label}:${y} / 成交量:${currentRawValueCeil}万亿 / 蒸发:${riseRawCeil}亿 / 涨跌幅:${rise}%`;
                return result;
              } else {
                const result = riseRawCeil > 0
                  ? `${context.dataset.label}:${y} / 总流通市值:${currentRawValueCeil}万亿 / 增加:${riseRawCeil}亿 / 涨跌幅:${rise}%`
                  : `${context.dataset.label}:${y} / 总流通市值:${currentRawValueCeil}万亿 / 蒸发:${riseRawCeil}亿 / 涨跌幅:${rise}%`;
                return result;
              }
            }
          }
        }
      }
    },
    data: {
      labels: response.markets.map(it => getFormatMonth(it.date)),
      datasets: [
        {
          type: 'line',
          label: `韭菜指数`,
          data: response.markets.map(it => it.marketIndex / marketIndexRatio),
          rawData: response.markets.map(it => it.amount)
        },
        {
          type: 'line',
          label: '上海主板/核心参照物（百亿）',
          data: response.markets.map(it => it.shMarketIndex / 100),
          rawData: response.markets.map(it => it.shAmount)
        },
        {
          type: 'line',
          label: '科创板',
          data: response.markets.map(it => it.kcMarketIndex / kcMarketIndexRatio),
          rawData: response.markets.map(it => it.kcAmount)
        },
        {
          type: 'line',
          label: '深圳主板',
          data: response.markets.map(it => it.szMarketIndex / szMarketIndexRatio),
          rawData: response.markets.map(it => it.szAmount)
        },
        {
          type: 'line',
          label: '创业板',
          data: response.markets.map(it => it.cyMarketIndex / cyMarketIndexRatio),
          rawData: response.markets.map(it => it.cyAmount)
        },
        {
          type: 'line',
          label: '北交所',
          data: response.markets.map(it => it.bjMarketIndex / bjMarketIndexRatio),
          rawData: response.markets.map(it => it.bjAmount)
        },
        {
          type: 'line',
          label: '量能指数',
          exchange: true,
          data: response.markets.map(it => it.exchange / exchangeIndexRatio),
          rawData: response.markets.map(it => it.exchange)
        },
      ],
    },
  });

  // -------------------------------------------------------------------------------------------------------------------
  const exchangeIndex = firstMarket?.exchange;
  const shExchangeRatio = firstMarket?.shExchange / exchangeIndex;
  const kcExchangeRatio = firstMarket?.kcExchange / exchangeIndex;
  const szExchangeRatio = firstMarket?.szExchange / exchangeIndex;
  const cyExchangeRatio = firstMarket?.cyExchange / exchangeIndex;
  const bjExchangeRatio = firstMarket?.bjExchange / exchangeIndex;

  new Chart(document.getElementById('exchangeChart'), {
    options: {
      responsive: true,
      animations: {
        tension: {
          duration: 1000,
          easing: 'linear',
          from: 0,
          to: 0.3,
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const currentRawValue = context.dataset.rawData[context.dataIndex];
              const currentRawValueCeil = _.ceil(currentRawValue, 2);
              if (context.dataIndex == 0) {
                return `${context.dataset.label}:${currentRawValueCeil}亿`;
              }
              const lastRawValue = context.dataset.rawData[context.dataIndex - 1];
              const riseRawCeil = _.ceil((currentRawValue - lastRawValue))

              const lastValue = context.dataset.data[context.dataIndex - 1];
              const rise = _.ceil((context.parsed.y - lastValue) / lastValue * 100, 2);
              const result = riseRawCeil > 0
                ? `${context.dataset.label}: ${currentRawValueCeil}亿 / 增加:${riseRawCeil}亿 / 涨跌幅:${rise}%`
                : `${context.dataset.label}: ${currentRawValueCeil}亿 / 蒸发:${riseRawCeil}亿 / 涨跌幅:${rise}%`;
              return result;
            }
          }
        }
      }
    },
    data: {
      labels: response.markets.map(it => getFormatMonth(it.date)),
      datasets: [
        {
          type: 'bar',
          label: '量能（亿）',
          data: response.markets.map(it => it.exchange),
          rawData: response.markets.map(it => it.exchange)
        },
        {
          type: 'line',
          label: '上海主板/量能指数',
          data: response.markets.map(it => it.shExchange / shExchangeRatio),
          rawData: response.markets.map(it => it.shExchange)
        },
        {
          type: 'line',
          label: '科创板/量能指数',
          data: response.markets.map(it => it.kcExchange / kcExchangeRatio),
          rawData: response.markets.map(it => it.kcExchange)
        },
        {
          type: 'line',
          label: '深圳主板/量能指数',
          data: response.markets.map(it => it.szExchange / szExchangeRatio),
          rawData: response.markets.map(it => it.szExchange)
        },
        {
          type: 'line',
          label: '创业板/量能指数',
          data: response.markets.map(it => it.cyExchange / cyExchangeRatio),
          rawData: response.markets.map(it => it.cyExchange)
        },
        {
          type: 'line',
          label: '北交所/量能指数',
          data: response.markets.map(it => it.bjExchange / bjExchangeRatio),
          rawData: response.markets.map(it => it.bjExchange)
        },
      ],
    },
  });

  console.log(`result markets ${lastRequestMarketNum} -> ${newsStore.marketIndex} -> ${response.markets.length}`);
}

// ---------------------------------------------------------------------------------------------------------------------

function formatCode(code: number) {
  let stockCode = _.toString(code);
  switch (stockCode.length) {
    case 0:
      stockCode = "000000";
      break;
    case 1:
      stockCode = `00000${stockCode}`;
      break;
    case 2:
      stockCode = `0000${stockCode}`;
      break;
    case 3:
      stockCode = `000${stockCode}`;
      break;
    case 4:
      stockCode = `00${stockCode}`;
      break;
    case 5:
      stockCode = `0${stockCode}`;
      break;
    case 6:
      break;
    default:
  }
  return stockCode;
}

async function goToEastMoney(code: number) {
  const stockCode = formatCode(code);
  if (stockCode.startsWith("8")) {
    window.open(`https://quote.eastmoney.com/bj/${stockCode}.html`, '_blank');
  } else if (stockCode.startsWith("688")) {
    window.open(`https://quote.eastmoney.com/kcb/${stockCode}.html`, '_blank');
  } else if (stockCode.startsWith("3") || stockCode.startsWith("0")) {
    window.open(`https://quote.eastmoney.com/sz${stockCode}.html`, '_blank');
  } else if (stockCode.startsWith("6")) {
    window.open(`https://quote.eastmoney.com/sh${stockCode}.html`, '_blank');
  } else {
    snackbarStore.showErrorMessage(`无法识别的代码[${stockCode}]`);
  }
}

async function goToUS(usRank: EastMoneyUSRank) {
  window.open(`https://quote.eastmoney.com/us/${usRank.code}.html`, '_blank');
}

async function goToRank() {
  window.open("https://guba.eastmoney.com/rank/", '_blank');
}

async function goToUrl(trending: Trending, event: Event, go: boolean = true) {
  let str = trending.title + " - " + trending.subTitle + " - " + parseTime(trending.ctime) + "\n\n";
  str = str + trending.url + "\n\n";
  str = str + randomQuoteWithWebSite();
  clipboard(str, event);
  snackbarStore.showSuccessMessage("复制成功");
  if (go) {
    setTimeout(() => {
      window.open(trending.url, '_blank');
    }, 300);
  }
}

async function goToUrlRouters(title: string, trending: Trending, event: Event) {
  let str = `${title} - ${trending.title} - ${trending.subTitle} - ${parseTime(trending.ctime)}\n\n`;
  str = str + trending.url + "\n\n";
  str = str + randomQuoteWithWebSite();
  clipboard(str, event);
  snackbarStore.showSuccessMessage("复制成功");
  setTimeout(() => {
    window.open(trending.url, '_blank');
  }, 300);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function scrollToMiddle() {
  window.scrollTo({ top: document.documentElement.scrollHeight / 1.7, behavior: "smooth" });
}
function scrollToBottom() {
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
}

function trendingClass(trending: Trending) {
  let classStr = "";
  if (new Date().getTime() - trending.ctime < NEW_TRENDING_TIME) {
    classStr = 'font-weight-black';
  }
  if (trending.level == 1) {
    classStr = ' text-red';
  }
  return classStr.trim();
}

function hotRankChange(rankChange: number) {
  if (rankChange > 0) {
    return `+${rankChange}`;
  } else {
    return _.toString(rankChange);
  }
}

function copyConcept(concept: Concept, event: Event) {
  let str = "";
  str = str + concept.level + "级情报 " + concept.ctime + "\n";
  str = str + "🆘" + concept.title + "\n\n" + concept.content + "\n\n";
  str = str + concept.url + "\n\n";
  str = str + randomQuoteWithWebSite();
  clipboard(str, event);
  snackbarStore.showSuccessMessage(concept.content + "复制成功");
}

function copyNews(news: News, event: Event) {
  let str = "";
  str = str + levelMap[news.level].type + "级情报 " + formatTimestampYYYYMMDDHHMM(news.ctime) + "\n";
  if (!_.isEmpty(news.title)) {
    str = str + "⚡️" + news.title + "\n\n"
  } else {
    str = str + "\n"
  }
  str = str + news.content + "\n";

  if (!_.isEmpty(news.stocks)) {
    str = str + "\n" + randomEmotion() + "股票:";
    for (const stock of news.stocks) {
      str = str + " " + stock.name + "#" + stock.price + "(" + stock.rise + ")";
    }
  }
  if (!_.isEmpty(news.concepts)) {
    str = str + "\n" + randomEmotion() + "概念:";
    for (const concept of news.concepts) {
      str = str + " " + concept.name + "(" + concept.rise + ")";
    }
  }
  if (!_.isEmpty(news.subjects)) {
    str = str + "\n" + randomEmotion() + "热词:";
    for (const subject of news.subjects) {
      str = str + " " + subject;
    }
  }
  str = str + "\n" + randomQuoteWithWebSite();
  clipboard(str, event);
  snackbarStore.showSuccessMessage("复制成功");
}

function isGoogleChrome() {
  const userAgent = navigator.userAgent;
  const isChromium = window.chrome !== undefined;
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isEdge = /Edg/.test(userAgent); // 排除 Microsoft Edge
  const isOpera = /OPR/.test(userAgent); // 排除 Opera

  return isChromium && isChrome && !isEdge && !isOpera;
}

</script>


<template>
  <v-container>
    <template v-if="mobile">
      <v-card v-if="!_.isEmpty(conceptsRef)" class="mt-3">
        <v-card-title v-ripple @click="requestConcepts(108, true)">
          <v-icon icon="mdi-wind-power" size="x-large"></v-icon>
          &nbsp;
          新概念
          &nbsp;
          <v-icon icon="mdi-format-list-bulleted" size="small" color="primary"></v-icon>
        </v-card-title>
        <v-card-subtitle>
          {{ conceptCoreRef }}
        </v-card-subtitle>
        <v-card-item v-for="concept in conceptsRef" :key="concept.id" class="text-pre-wrap py-1" v-ripple
                     @click="copyConcept(concept, $event)">
          <v-row>
            <v-col class="font-weight-bold" cols="4">
              {{ concept.ctime }}
            </v-col>
            <v-col class="font-weight-bold px-0 mx-0">
              <a :href="concept.url" class="text-blue-lighten-2 font-weight-black" target="_blank">
                {{ concept.content }}
              </a>
              <v-icon v-if="new Date().getTime() - concept.time < NEW_CONCEPT_TIME" color="red" icon="mdi-alert-octagram-outline" size="small"></v-icon>
            </v-col>
          </v-row>
        </v-card-item>
      </v-card>
      <v-card v-if="!_.isEmpty(eastMoneyRanksRef)" class="mt-3">
        <v-card-title v-ripple @click="goToRank()">
          <v-icon icon="mdi-chili-hot" size="x-large"></v-icon>
          &nbsp;
          Top排行
          &nbsp;
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
            <tr>
              <th>
                排名
              </th>
              <th>
                美股人气榜 | 纳斯达克
              </th>
              <th>
                A股人气榜
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(rank, i) in eastMoneyRanksRef" :key="i">
              <td>{{ i + 1 }}</td>
              <td :class="eastMoneyUSRanksRef[i].primary ? 'cursor-pointer font-weight-black text-red' : 'cursor-pointer'" v-tooltip:end="'跳转东方财富'" v-ripple @click="goToUS(eastMoneyUSRanksRef[i])">
                {{ eastMoneyUSRanksRef[i].code }} | {{ eastMoneyUSRanksRef[i].chineseName }}
              </td>
              <td :class="rank.primary ? 'cursor-pointer font-weight-black text-red' : 'cursor-pointer'" v-tooltip:end="'跳转东方财富'" v-ripple @click="goToEastMoney(rank.code)">
                {{ rank.name }}
              </td>
            </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
      <v-card v-if="!_.isEmpty(bloomBergTrendingRef)" class="mt-3">
        <v-card-title>
          <v-icon icon="mdi-chart-bell-curve"></v-icon>
          &nbsp;
          彭博社
          &nbsp;
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
            <tr>
              <th>
                独家资讯
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(trending, i) in bloomBergTrendingRef" :key="i" class="cursor-pointer" v-ripple @click="goToUrlRouters('彭博社', trending, $event)">
              <td :class="trendingClass(trending)">
                {{ i + 1 }}.{{ trending.title }} - {{ trending.subTitle }} - {{ formatTimeAgo(trending.ctime) }}
              </td>
            </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
      <v-card v-if="!_.isEmpty(reutersTrendingRef)" class="mt-3">
        <v-card-title>
          <v-icon icon="mdi-routes"></v-icon>
          &nbsp;
          路透社
          &nbsp;
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
            <tr>
              <th>
                内幕电报
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(trending, i) in reutersTrendingRef" :key="i" class="cursor-pointer" v-ripple @click="goToUrlRouters('路透社', trending, $event)">
              <td :class="trendingClass(trending)">
                {{ i + 1 }}.{{ trending.title }} - {{ trending.subTitle }} - {{ formatTimeAgo(trending.ctime) }}
              </td>
            </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
      <v-card v-if="!_.isEmpty(xueqiuTrendingRef)" class="mt-3">
        <v-card-title>
          <v-icon icon="mdi-electron-framework"></v-icon>
          &nbsp;
          东方财富 & 雪球 & 财联社
          &nbsp;
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
            <tr>
              <th>
                智能聚合
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(trending, i) in xueqiuTrendingRef" :key="i" class="cursor-pointer" v-ripple @click="goToUrl(trending, $event)">
              <td :class="trendingClass(trending)">
                {{ i + 1 }}.{{ trending.title }}
              </td>
            </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
      <v-card v-if="!_.isEmpty(dfcfTrendingRef)" class="mt-3">
        <v-card-title>
          <v-icon icon="mdi-lightbulb-on-outline"></v-icon>
          &nbsp;
          研报
          &nbsp;
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
            <tr>
              <th>
                策略报告
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(trending, i) in dfcfTrendingRef" :key="i" class="cursor-pointer" v-ripple @click="goToUrl(trending, $event, false)">
              <td :class="trendingClass(trending)">
                <a :href="trending.url" referrerPolicy="no-referrer" target="_blank">{{ i + 1 }}.{{ trending.title }}</a>
              </td>
            </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
      <v-card v-if="!_.isEmpty(douyinTrendingRef)" class="mt-3">
        <v-card-title>
          <v-icon icon="mdi-music-circle-outline"></v-icon>
          &nbsp;
          抖音热榜
          &nbsp;
        </v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
            <tr>
              <th>
                关键词
              </th>
              <th>
                热度
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(trending, i) in douyinTrendingRef" :key="i" class="cursor-pointer" v-ripple @click="goToUrl(trending, $event)">
              <td :class="trendingClass(trending)">
                {{ i + 1 }}.{{ trending.title }}
              </td>
              <td>{{ trending.subTitle }}</td>
            </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
      <template v-for="newsEle in newsRef">
        <v-card class="mt-3">
          <v-card-title v-ripple @click="copyNews(newsEle, $event)">
            <v-icon :color="levelMap[newsEle.level].color" :icon="levelMap[newsEle.level].icon"></v-icon>
            级情报 {{ formatTimestampMMDDHHMM(newsEle.ctime) }}
            <v-icon v-if="newsStore.isNew(newsEle.id)" color="primary" icon="mdi-new-box"></v-icon>
          </v-card-title>
          <v-card-subtitle>
            {{ newsEle.title }}
          </v-card-subtitle>
          <v-card-text class="text-pre-wrap">
            {{ newsEle.content }}
          </v-card-text>
          <v-card-actions
            v-if="!_.isEmpty(newsEle.stocks) || !_.isEmpty(newsEle.concepts) || !_.isEmpty(newsEle.subjects)">
            <div>
              <template v-if="!_.isEmpty(newsEle.stocks)">
                <v-chip v-for="stock in newsEle.stocks" :color="_.toNumber(stock.rise) > 8 ? 'primary' : ''" size="x-small" class="mr-1">
                  {{ stock.name }} {{ stock.price }} / {{ stock.rise }}
                </v-chip>
              </template>
              <template v-if="!_.isEmpty(newsEle.concepts)">
                <v-icon v-if="!_.isEmpty(newsEle.stocks)" icon="mdi-slash-forward"></v-icon>
                <v-chip v-for="concept in newsEle.concepts" :color="_.toNumber(concept.rise) > 2 ? 'primary' : ''" size="x-small" variant="outlined"
                        class="mr-1">
                  {{ concept.name }} {{ concept.rise }}
                </v-chip>
              </template>
              <template v-if="!_.isEmpty(newsEle.subjects)">
                <v-icon v-if="!_.isEmpty(newsEle.stocks) || !_.isEmpty(newsEle.concepts)" icon="mdi-slash-forward"></v-icon>
                <v-chip v-for="subject in newsEle.subjects" size="x-small" class="mr-1">
                  {{ subject }}
                </v-chip>
              </template>
            </div>
          </v-card-actions>
        </v-card>
      </template>
    </template>
    <v-timeline v-else density="compact" side="end">
      <v-timeline-item v-if="!_.isEmpty(conceptsRef)" fill-dot dot-color="grey" size="x-large">
        <template v-slot:icon>
          <span>SSR</span>
        </template>
        <v-card min-width="580px">
          <v-card-title class="cursor-pointer" v-tooltip:start="'更多概念'" v-ripple
                        @click="requestConcepts(108, true)">
            <v-icon icon="mdi-wind-power" size="x-large"></v-icon>
            &nbsp;
            新概念
            &nbsp;
            <v-icon icon="mdi-format-list-bulleted" size="small" color="primary"></v-icon>
          </v-card-title>
          <v-card-subtitle class="text-wrap">
            {{ conceptCoreRef }}
          </v-card-subtitle>
          <v-card-item v-for="concept in conceptsRef" :key="concept.id" class="text-pre-wrap py-1" v-ripple
                       @click="copyConcept(concept, $event)">
            <v-row>
              <v-col class="font-weight-bold" cols="3">
                {{ concept.ctime }}
              </v-col>
              <v-col class="font-weight-bold">
                <a :href="concept.url" class="text-blue-lighten-2 font-weight-black" target="_blank">
                  {{ concept.content }}
                </a>
                {{ concept.title }}
                <v-icon v-if="new Date().getTime() - concept.time < NEW_CONCEPT_TIME" color="red" icon="mdi-alert-octagram-outline"></v-icon>
              </v-col>
            </v-row>
          </v-card-item>
        </v-card>
      </v-timeline-item>
      <v-timeline-item v-if="!_.isEmpty(eastMoneyRanksRef)" fill-dot dot-color="grey" size="x-large">
        <template v-slot:icon>
          <span>Rank</span>
        </template>
        <v-card>
          <v-card-title v-ripple class="cursor-pointer" @click="goToRank()">
            <v-icon icon="mdi-chili-hot" size="x-large"></v-icon>
            &nbsp;
            Top排行（点击跳转总人气排行）
            &nbsp;
          </v-card-title>
          <v-card-text>
            <v-table density="compact">
              <thead>
              <tr>
                <th>
                  排名
                </th>
                <th>
                  美股人气榜 | 纳斯达克
                </th>
                <th>
                  升降
                </th>
                <th>
                  A股人气榜
                </th>
                <th>
                  升降
                </th>
                <th>
                  AI解析(红色字体的股票为最近3天新出现在前100的人气个股)
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(rank, i) in eastMoneyRanksRef" :key="i">
                <td>{{ i + 1 }}</td>
                <td :class="eastMoneyUSRanksRef[i].primary ? 'cursor-pointer font-weight-black text-red' : 'cursor-pointer'" v-tooltip:end="'跳转东方财富'" v-ripple @click="goToUS(eastMoneyUSRanksRef[i])">
                  {{ eastMoneyUSRanksRef[i].code }} | {{ eastMoneyUSRanksRef[i].chineseName }}
                </td>
                <td>{{ hotRankChange(eastMoneyUSRanksRef[i].rankChange) }}</td>

                <td :class="rank.primary ? 'cursor-pointer font-weight-black text-red' : 'cursor-pointer'" v-tooltip:end="'跳转东方财富'" v-ripple @click="goToEastMoney(rank.code)">
                  {{ rank.name }}
                </td>
                <td>{{ hotRankChange(rank.rankChange) }}</td>
                <td v-html="rank.info"></td>
              </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-timeline-item>
      <v-timeline-item fill-dot dot-color="primary" size="x-large">
        <template v-slot:icon>
          <span>韭指</span>
        </template>
        <v-card :min-width="isGoogleChrome() ? '80vw' : '60vw'">
          <v-card-text>
            <canvas id="indexChart"></canvas>
          </v-card-text>
          <v-card-subtitle>
            上海主板的核心参照物是累加了上海主板所有股票的流通市值（去除了银行）
            <v-slider v-model="newsStore.marketIndex" prepend-icon="mdi-swap-horizontal" min="1" max="512" step="1"></v-slider>
          </v-card-subtitle>
        </v-card>
      </v-timeline-item>
      <v-timeline-item fill-dot dot-color="primary" size="x-large">
        <template v-slot:icon>
          <span>量能</span>
        </template>
        <v-card :min-width="isGoogleChrome() ? '80vw' : '60vw'">
          <v-card-text>
            <canvas id="exchangeChart"></canvas>
          </v-card-text>
        </v-card>
      </v-timeline-item>
      <v-timeline-item v-if="!_.isEmpty(douyinTrendingRef) || !_.isEmpty(xueqiuTrendingRef)" fill-dot dot-color="grey" size="x-large">
        <template v-slot:icon>
          <span>Hot</span>
        </template>
        <v-container class="pa-0">
          <v-row>
            <v-col cols="6">
              <v-card v-tooltip:start="'黑色粗体为一天内的资讯'">
                <v-card-title>
                  <v-icon icon="mdi-chart-bell-curve"></v-icon>
                  &nbsp;
                  彭博社
                  &nbsp;
                </v-card-title>
                <v-card-text>
                  <v-table density="compact">
                    <thead>
                    <tr>
                      <th>
                        独家资讯
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(trending, i) in bloomBergTrendingRef" :key="i" class="cursor-pointer" v-ripple @click="goToUrlRouters('彭博社', trending, $event)">
                      <td :class="trendingClass(trending)">
                        {{ i + 1 }}.{{ trending.title }} - {{ trending.subTitle }} - {{ formatTimeAgo(trending.ctime) }}
                      </td>
                    </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card v-tooltip:start="'黑色粗体为一天内的电报'">
                <v-card-title>
                  <v-icon icon="mdi-routes"></v-icon>
                  &nbsp;
                  路透社
                  &nbsp;
                </v-card-title>
                <v-card-text>
                  <v-table density="compact">
                    <thead>
                    <tr>
                      <th>
                        内幕电报
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(trending, i) in reutersTrendingRef" :key="i" class="cursor-pointer" v-ripple @click="goToUrlRouters('路透社', trending, $event)">
                      <td :class="trendingClass(trending)">
                        {{ i + 1 }}.{{ trending.title }} - {{ trending.subTitle }} - {{ formatTimeAgo(trending.ctime) }}
                      </td>
                    </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="5">
              <v-card>
                <v-card-title>
                  <v-icon icon="mdi-electron-framework"></v-icon>
                  &nbsp;
                  东方财富 & 雪球 & 财联社
                  &nbsp;
                </v-card-title>
                <v-card-text>
                  <v-table density="compact">
                    <thead>
                    <tr>
                      <th>
                        智能聚合
                      </th>
                      <th>
                        来源
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(trending, i) in xueqiuTrendingRef" :key="i" class="cursor-pointer" v-ripple @click="goToUrl(trending, $event)">
                      <td :class="trendingClass(trending)">
                        {{ i + 1 }}.{{ trending.title }}
                      </td>
                      <td>{{ trending.subTitle }}</td>
                    </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="4">
              <v-card>
                <v-card-title>
                  <v-icon icon="mdi-lightbulb-on-outline"></v-icon>
                  &nbsp;
                  研报
                  &nbsp;
                </v-card-title>
                <v-card-text>
                  <v-table density="compact">
                    <thead>
                    <tr>
                      <th>
                        策略报告
                      </th>
                      <!--                      <th>-->
                      <!--                        媒体-->
                      <!--                      </th>-->
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(trending, i) in dfcfTrendingRef" :key="i" class="cursor-pointer" v-ripple @click="goToUrl(trending, $event, false)">
                      <td :class="trendingClass(trending)">
                        <a :href="trending.url" referrerPolicy="no-referrer" target="_blank">{{ i + 1 }}.{{ trending.title }}</a>
                      </td>
                      <!--                      <td><a :href="trending.url" referrerPolicy="no-referrer" target="_blank">{{ trending.subTitle }}</a></td>-->
                    </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="3">
              <v-card>
                <v-card-title>
                  <v-icon icon="mdi-music-circle-outline"></v-icon>
                  &nbsp;
                  抖音热榜
                  &nbsp;
                </v-card-title>
                <v-card-text>
                  <v-table density="compact">
                    <thead>
                    <tr>
                      <th>
                        关键词
                      </th>
                      <th>
                        热度
                      </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(trending, i) in douyinTrendingRef" :key="i" class="cursor-pointer" v-ripple @click="goToUrl(trending, $event)">
                      <td :class="trendingClass(trending)">
                        {{ i + 1 }}.{{ trending.title }}
                      </td>
                      <td>{{ trending.subTitle }}</td>
                    </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-timeline-item>
      <v-timeline-item v-for="newsEle in newsRef" fill-dot :dot-color="levelMap[newsEle.level].color" :size="levelMap[newsEle.level].size">
        <template v-slot:icon>
          <span>{{ levelMap[newsEle.level].type }}</span>
        </template>
        <v-card max-width="1100px">
          <v-card-title class="cursor-pointer" v-tooltip:start="'复制'" v-ripple @click="copyNews(newsEle, $event)">
            <v-icon :color="levelMap[newsEle.level].color" :icon="levelMap[newsEle.level].icon"></v-icon>
            级情报 {{ formatTimestampMMDDHHMM(newsEle.ctime) }}
            <v-icon v-if="newsStore.isNew(newsEle.id)" color="primary" icon="mdi-new-box"></v-icon>
          </v-card-title>
          <v-card-subtitle>
            {{ newsEle.title }}
          </v-card-subtitle>
          <v-card-text class="text-pre-wrap">
            {{ newsEle.content }}
          </v-card-text>
          <v-card-actions
            v-if="!_.isEmpty(newsEle.stocks) || !_.isEmpty(newsEle.concepts) || !_.isEmpty(newsEle.subjects)">
            <div>
              <template v-if="!_.isEmpty(newsEle.stocks)">
                <v-chip v-for="stock in newsEle.stocks" :color="_.toNumber(stock.rise) > 8 ? 'primary' : ''" size="x-small" class="mr-1">
                  {{ stock.name }} {{ stock.price }} / {{ stock.rise }}
                </v-chip>
              </template>
              <template v-if="!_.isEmpty(newsEle.concepts)">
                <v-icon v-if="!_.isEmpty(newsEle.stocks)" icon="mdi-slash-forward"></v-icon>
                <v-chip v-for="concept in newsEle.concepts" :color="_.toNumber(concept.rise) > 2 ? 'primary' : ''" size="x-small" variant="outlined"
                        class="mr-1">
                  {{ concept.name }} {{ concept.rise }}
                </v-chip>
              </template>
              <template v-if="!_.isEmpty(newsEle.subjects)">
                <v-icon v-if="!_.isEmpty(newsEle.stocks) || !_.isEmpty(newsEle.concepts)" icon="mdi-slash-forward"></v-icon>
                <v-chip v-for="subject in newsEle.subjects" size="x-small" class="mr-1">
                  {{ subject }}
                </v-chip>
              </template>
            </div>
          </v-card-actions>
        </v-card>
      </v-timeline-item>
    </v-timeline>
    <v-progress-linear v-if="loadingRef" indeterminate color="primary"></v-progress-linear>
    <v-footer v-else v-ripple class="d-flex flex-column" color="primary" @click="loadMoreNews">
      更多
    </v-footer>
    <v-fab icon color="primary" app>
      <v-icon>{{ floatingButtonRef ? 'mdi-rocket' : 'mdi-rocket-launch-outline' }}</v-icon>
      <v-speed-dial v-model="floatingButtonRef" activator="parent">
        <v-btn key="3" color="success" icon @click="scrollToBottom">
          <v-icon>mdi-arrow-down-bold-outline</v-icon>
        </v-btn>

        <v-btn key="2" color="warning" icon @click="scrollToMiddle">
          <v-icon>mdi-format-align-middle</v-icon>
        </v-btn>

        <v-btn key="1" color="info" icon @click="scrollToTop">
          <v-icon>mdi-arrow-up-bold-outline</v-icon>
        </v-btn>
      </v-speed-dial>
    </v-fab>
  </v-container>

  <AnimationLeek1 v-if="_.isEmpty(newsRef)" :size="width"/>
</template>
