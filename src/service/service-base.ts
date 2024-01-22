import {TdBaseTableProps} from "tdesign-vue"
import mqtt from "mqtt"
import CommonTable from "@/pages/system/components/CommonTable.vue"
import axios from "axios"

interface DashboardPanel {
  title: string;
  number: string | number | (() => string | number);
  leftType: string;
  upTrend?: string;
  downTrend?: string;
}

interface Gatewaydata {
  title: string;
  number: string | number | (() => string | number);
}

interface TendItem {
  growUp?: number;
  productName: string;
  count: number;
  proportion: string;
  date: string;
}

interface productItem {
  productName: string;
  province: string;
  username: string;
  size: string;
  count: number;
}

export const PANE_LIST: Array<DashboardPanel> = [
  {
    title: "总灯数（个）",
    number: "N/A",
    leftType: "echarts-line",
  },
  {
    title: "本周能耗总数（Kw‧h）",
    number: "N/A",
    downTrend: "20.5%",
    leftType: "echarts-bar",
  },
  {
    title: "预警数（个数）",
    number: "N/A",
    upTrend: "30.5%",
    leftType: "icon-usergroup",
  },
  {
    title: "MQTT连接状况",
    number: "N/A",
    downTrend: "40.5%",
    leftType: "icon-file-paste",
  },
]

export const SALE_TEND_LIST: Array<TendItem> = [
  {
    growUp: 1,
    productName: "B2停车场",
    count: 6.05,
    proportion: "100%",
    date: "2021-09-01",
  },
]

export const BUY_TEND_LIST: Array<productItem> = [
  {
    productName: "景枫",
    province: "江苏省-南京市",
    username: "坤科节能科技",
    size: "",
    count: 1,
  }
]

export const SALE_COLUMNS: TdBaseTableProps["columns"] = [
  {
    align: "center",
    colKey: "index",
    title: "排名",
    width: 80,
    fixed: "left",
  },
  {
    align: "left",
    ellipsis: true,
    colKey: "productName",
    title: "区域名称",
    minWidth: 200,
  },
  {
    align: "center",
    colKey: "growUp",
    width: 100,
    title: "较上周",
  },
  {
    align: "center",
    colKey: "count",
    title: "能耗",
    width: 100,
  },
  {
    align: "center",
    colKey: "proportion",
    title: "能耗占比",
    width: 100,
  },
  {
    align: "center",
    colKey: "date",
    width: 140,
    title: "合同签订日期",
  },
  {
    align: "center",
    colKey: "operation",
    title: "操作",
    width: 80,
    fixed: "right",
  },
]

export const BUY_COLUMNS: TdBaseTableProps["columns"] = [
  {
    align: "center",
    colKey: "project",
    title: "项目名称",
    width: 100,
    fixed: "left",
  },
  {
    align: "left",
    ellipsis: true,
    colKey: "address",
    title: "省市",
    minWidth: 100,
  },
  {
    align: "center",
    colKey: "project",
    width: 150,
    title: "客户名称",
  },
  {
    align: "center",
    colKey: "size",
    title: "项目规模",
    width: 100,
  },
  {
    align: "center",
    colKey: "count",
    width: 140,
    title: "灯控用户数量",
  },
  {
    align: "center",
    colKey: "operation",
    title: "操作",
    width: 80,
    fixed: "right",
  },
]

export const PANE_LIST_DATA: Array<Gatewaydata> = [
  {
    title: "温度(°C)",
    number: "13",
  },
  {
    title: "湿度(%)",
    number: "13",
  },
  {
    title: "光强(Lx)",
    number: "4",
  },
  {
    title: "功率(W)",
    number: "4",
  },
]

/**
 * MQTT部分
 */
export class DataObtain {
  client: mqtt.MqttClient;
  client1: mqtt.MqttClient;
  mqttConnectionStatus: string;
  receivedMessages: Array<any>;
  temperatureData: Array<{ time: string; value: string }> = [];
  humidityData: Array<{ time: string; value: string }> = [];
  lightingData: Array<{ time: string; value: string }> = [];
  powerData: Array<{ time: string; value: string }> = [];
  tableData: Array<any> = [];
  lightData: Array<any> = [];


  constructor() {
    // 初始化类的属性
    this.client = null
    this.mqttConnectionStatus = ""
    this.receivedMessages = []
    this.temperatureData = []
    this.humidityData = []
    this.lightingData = []
    this.powerData = []
    this.lightData = []
    // 调用initMqtt方法
    this.initMqtt()
    setInterval(() => {
      this.fetchData()
    }, 1000)
  }
  /**
   *
   * 信息读取函数 后端地址 http://localhost:8026/api/light_data/items
   */
  // 信息读取
  async fetchData() {
    try {
      const response = await axios.get("http://localhost:8026/api/light_data/items")
      this.lightData = response.data

      // 使用 reduce 方法计算所有 "power" 属性值的总和
      const totalPower = this.lightData.reduce((accumulator, currentValue) => {
        const powerValue = parseFloat(currentValue.power) || 0 // 将 "power" 转换为数字，如果无效则为 0
        return accumulator + powerValue
      }, 0)

      const currentTime = new Date()

      // 更新 PANE_LIST[0].number 和 PANE_LIST[1].number
      PANE_LIST[0].number = this.lightData.length
      PANE_LIST[1].number = totalPower

      // 计算与当前时间差两小时的设备数量
      const devicesWithinTwoHours = this.lightData.filter(item => {
        const consumptionUpdateTime = new Date(item.ConsumptionUpdate)
        const timeDifference = currentTime.getTime() - consumptionUpdateTime.getTime()
        return timeDifference > 2 * 60 * 60 * 1000
      })

      // 更新 PANE_LIST[2].number
      PANE_LIST[2].number = devicesWithinTwoHours.length

    } catch (error) {
      console.error("获取数据时出错", error)
    }
  }


  /**
   * MQTT连接函数
   */
  initMqtt() {
    // 连接配置选项
    const options = {
      connectTimeout: 4000, // 超时时间
      clientId: "", // 不填默认随机生成一个ID
    }

    // 连接成功
    this.client = mqtt.connect("ws://106.15.121.181:8083/mqtt", options)
    this.client1 = mqtt.connect("ws://122.51.210.27:8083/mqtt", options)
    this.client.on("connect", () => {
      this.mqttConnectionStatus = "已连接"
      console.log("连接成功")

      // 连接成功后订阅消息
      this.subscribes()
      // 更新number属性的值为实际的连接状态
      this.updateNumber()
    })

    // 重连提醒
    this.client.on("reconnect", () => {
      this.mqttConnectionStatus = "正在重连"
      console.log("正在重连")
      // 更新number属性的值为实际的连接状态
      this.updateNumber()
    })

    // 连接失败提醒
    this.client.on("error", (error) => {
      this.mqttConnectionStatus = "连接失败"
      console.log("连接失败", error)
      // 更新number属性的值为实际的连接状态
      this.updateNumber()
    })
  }

  /**
   * MQTT订阅函数(订阅多个信息)
   */
  subscribes() {
    const arr = ["/sys/ibms_shgh_zm/gs08291110/thing/event/current/post", "/sys/ibms_shgh_zm/gs08291110/thing/event/consumption/post"]
    this.client.subscribe(arr, {qos: 1}, (err) => {
      if (!err) {
        console.log(`主题为：“${arr}” 的消息订阅成功`)
      } else {
        console.log("消息订阅失败")
      }
    })
    const arr1 = ["led/emqx", "temp_hum/emqx", "online/emqx"]
    this.client1.subscribe(arr1, {qos: 1}, (err) => {
      if (!err) {
        console.log(`主题为：“${arr1}” 的消息订阅成功`)
      } else {
        console.log("消息订阅失败")
      }
    })
    // 在订阅成功后更新 receivedMessages 数组
    this.client.on("message", function (topic, message, packet) {
      this.handleReceivedMessage(topic, message, packet)
      console.log(`接收到消息，主题：${topic}, 消息：${message.toString()}`)
    }.bind(this))

    this.client1.on("message", function (topic, message, packet) {
      this.handleReceivedMessage(topic, message, packet)
      console.log(`接收到消息，主题：${topic}, 消息：${message.toString()}`)
    }.bind(this))
  }

  /**
   * 从订阅主题消息中获取相应键值数据
   */
  getLatestValueByTopic(topic, key) {
    const messagesForTopic = this.receivedMessages.filter(message => message.topic === topic)
    if (messagesForTopic.length > 0) {
      const messageContent = JSON.parse(messagesForTopic[0].message)
      return messageContent[key] !== undefined ? messageContent[key] : "N/A"
    } else {
      return "N/A" // 如果没有匹配到消息，返回 "N/A"
    }
  }
  /**
   * 数据处理
   */
  handleReceivedMessage(topic, message, packet) {
    // 解析 MQTT 消息
    const mqttData = JSON.parse(message.toString())

    // 在访问 'params' 和 'value' 属性之前添加空值检查
    const params = mqttData.params
    const value = params?.value

    // 将接收到的消息添加到 receivedMessages 数组中
    this.receivedMessages.unshift({
      topic: topic,
      message: message.toString(),
      packet: packet
    })

    // 在访问 'value' 属性之前添加空值检查
    if (value) {
      const rowData = {
        uuid: value.uuid,
        area: value.area,
        cluster: value.cluster,
        number: value.number,
        scene_no: value.scene_no,
        light_mode: value.light_mode,
        energy_dur: value.energy_dur,
        device_name: value.device_name,
        power: value.power,
        ConsumptionUpdate: "",
        current_bright: value.current_bright,
        high_bright: value.high_bright,
        standby_bright: value.standby_bright,
        current_cct: value.current_cct,
        delay_mode: value.delay_mode,
        delay_time: value.delay_time,
        delay_time2: value.delay_time2,
        time_dur: value.time_dur,
        customer: "坤科节能",
      }
      // 将数据添加到表格数据数组中
      this.tableData.unshift(rowData)
    }
  }
  updateNumber() {
    PANE_LIST_DATA[0].number = this.getLatestValueByTopic("online/emqx", "temp")
    PANE_LIST_DATA[1].number = this.getLatestValueByTopic("online/emqx", "hum")
    PANE_LIST_DATA[2].number = this.getLatestValueByTopic("online/emqx", "light")
    PANE_LIST_DATA[3].number = this.getLatestValueByTopic("online/emqx", "power")
    PANE_LIST[3].number = this.mqttConnectionStatus
  }
}

// 实例化类
new DataObtain()
