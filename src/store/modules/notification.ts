export interface msgDataItem {
  id: string;
  content: string;
  type: string;
  status: boolean;
  collected: boolean;
  date: string;
  quality: string;
}
// 定义的state初始值
const state: { msgData: Array<msgDataItem> } = {
  msgData: [
    {
      id: "123",
      content: "测试通知",
      type: "测试",
      status: true,
      collected: false,
      date: "2023-12-12 08:00",
      quality: "high",
    },
  ],
}

const mutations = {
  setMsgData(state, data) {
    // eslint-disable-next-line no-param-reassign
    state.msgData = data
  },
}

const getters = {
  unreadMsg: (state) => state.msgData.filter((item) => item.status),
  readMsg: (state) => state.msgData.filter((item) => !item.status),
}

const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
}
