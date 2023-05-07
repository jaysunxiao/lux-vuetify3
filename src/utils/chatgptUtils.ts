import {send, isWebsocketReady} from "@/utils/websocket";
import {useSnackbarStore} from "@/stores/snackbarStore";
import { isMobile } from "@/utils/common";
import _ from "lodash";

import ChatgptMessageRequest from "@/protocol/chatgpt/ChatgptMessageRequest";

const snackbarStore = useSnackbarStore();

export function sendChatgpt(messages) {
  if (!isWebsocketReady()) {
    snackbarStore.showErrorMessage("请稍等，无法连接服务器");
    return;
  }
  if (_.isEmpty(messages)) {
    snackbarStore.showErrorMessage("请输入聊天内容");
    return;
  }

  const request = new ChatgptMessageRequest();
  request.mobile = isMobile();

  // const size = _.size(messages);
  // if (size < 2) {
  //   messages.forEach(it => request.messages.push(it.content));
  // } else {
  //   request.messages.push(messages[size - 2]);
  //   request.messages.push(messages[size - 1]);
  // }

  messages.forEach(it => request.messages.push(it.content));

  send(request);
}
