import {TdBaseTableProps} from 'tdesign-vue';
import mqtt from 'mqtt';

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
    title: '总灯数',
    number: '100个',
    upTrend: '10.5%',
    leftType: 'echarts-line',
  },
  {
    title: '本周能耗总数（Kw‧h）',
    number: '1000',
    downTrend: '20.5%',
    leftType: 'echarts-bar',
  },
  {
    title: '预警数',
    number: '1126',
    upTrend: '30.5%',
    leftType: 'icon-usergroup',
  },
  {
    title: 'MQTT连接状况',
    number: '',
    downTrend: '40.5%',
    leftType: 'icon-file-paste',
  },
];

export const SALE_TEND_LIST: Array<TendItem> = [
  {
    growUp: 1,
    productName: 'B2停车场',
    count: 6.05,
    proportion: '100%',
    date: '2021-09-01',
  },
];

export const BUY_TEND_LIST: Array<productItem> = [
  {
    productName: '景枫',
    province: '江苏省-南京市',
    username: '坤科节能科技',
    size: '',
    count: 1,
  }
];

export const SALE_COLUMNS: TdBaseTableProps['columns'] = [
  {
    align: 'center',
    colKey: 'index',
    title: '排名',
    width: 80,
    fixed: 'left',
  },
  {
    align: 'left',
    ellipsis: true,
    colKey: 'productName',
    title: '区域名称',
    minWidth: 200,
  },
  {
    align: 'center',
    colKey: 'growUp',
    width: 100,
    title: '较上周',
  },
  {
    align: 'center',
    colKey: 'count',
    title: '能耗',
    width: 100,
  },
  {
    align: 'center',
    colKey: 'proportion',
    title: '能耗占比',
    width: 100,
  },
  {
    align: 'center',
    colKey: 'date',
    width: 140,
    title: '合同签订日期',
  },
  {
    align: 'center',
    colKey: 'operation',
    title: '操作',
    width: 80,
    fixed: 'right',
  },
];

export const BUY_COLUMNS: TdBaseTableProps['columns'] = [
  {
    align: 'center',
    colKey: 'productName',
    title: '项目名称',
    width: 100,
    fixed: 'left',
  },
  {
    align: 'left',
    ellipsis: true,
    colKey: 'province',
    title: '省市',
    minWidth: 100,
  },
  {
    align: 'center',
    colKey: 'username',
    width: 150,
    title: '客户名称',
  },
  {
    align: 'center',
    colKey: 'size',
    title: '项目规模',
    width: 100,
  },
  {
    align: 'center',
    colKey: 'count',
    width: 140,
    title: '灯控用户数量',
  },
  {
    align: 'center',
    colKey: 'operation',
    title: '操作',
    width: 80,
    fixed: 'right',
  },
];

export const PANE_LIST_DATA: Array<Gatewaydata> = [
  {
    title: '温度(°C)',
    number: '13',
  },
  {
    title: '湿度(%)',
    number: '13',
  },
  {
    title: '光强(Lx)',
    number: '4',
  },
  {
    title: '功率(W)',
    number: '4',
  },
];

/**
 * MQTT部分
 */
export class MqttConnection {
  client: mqtt.MqttClient;
  mqttConnectionStatus: string;
  receivedMessages: Array<any>;
  temperatureData: Array<{ time: string; value: string }> = [];
  humidityData: Array<{ time: string; value: string }> = [];
  lightingData: Array<{ time: string; value: string }> = [];
  powerData: Array<{ time: string; value: string }> = [];

  constructor() {
    // 初始化类的属性
    this.client = null;
    this.mqttConnectionStatus = '';
    this.receivedMessages = [];
    this.temperatureData = [];
    this.humidityData = [];
    this.lightingData = [];
    this.powerData = [];
    // 调用initMqtt方法
    this.initMqtt();
    this.updateChartData();
    setInterval(() => {
      this.updateChartData();
      PANE_LIST_DATA[0].number = this.getLatestValueByTopic('temp_hum/emqx', 'temp');
      PANE_LIST_DATA[1].number = this.getLatestValueByTopic('temp_hum/emqx', 'hum');
      PANE_LIST_DATA[2].number = this.getLatestValueByTopic('temp_hum/emqx', 'light');
      PANE_LIST_DATA[3].number = this.getLatestValueByTopic('temp_hum/emqx', 'power');
    }, 1000);
  }

  /**
   * MQTT连接函数
   */
  initMqtt() {
    // 连接配置选项
    let options = {
      connectTimeout: 4000, // 超时时间
      clientId: '', // 不填默认随机生成一个ID
    };

    // 连接成功
    this.client = mqtt.connect('ws://122.51.210.27:8083/mqtt', options);

    this.client.on('connect', () => {
      this.mqttConnectionStatus = '已连接';
      console.log('连接成功');

      // 连接成功后订阅消息
      this.subscribes();

      // 更新number属性的值为实际的连接状态
      this.updateNumber();
    });

    // 重连提醒
    this.client.on('reconnect', () => {
      this.mqttConnectionStatus = '正在重连';
      console.log('正在重连');

      // 更新number属性的值为实际的连接状态
      this.updateNumber();
    });

    // 连接失败提醒
    this.client.on('error', (error) => {
      this.mqttConnectionStatus = '连接失败';
      console.log('连接失败', error);

      // 更新number属性的值为实际的连接状态
      this.updateNumber();
    });
  }

  /**
   * MQTT订阅函数(订阅多个信息)
   */
  subscribes() {
    const arr = ['temp_hum/emqx', 'led/emqx', 'online/emqx']
    this.client.subscribe(arr, {qos: 1}, (err) => {
      if (!err) {
        console.log(`主题为：“${arr}” 的消息订阅成功`)
      } else {
        console.log('消息订阅失败')
      }
    })
    // 在订阅成功后更新 receivedMessages 数组
    this.client.on('message', function (topic, message, packet) {
      this.handleReceivedMessage(topic, message, packet);
      console.log(`接收到消息，主题：${topic}, 消息：${message.toString()}`);
    }.bind(this));
  }

  /**
   * 从订阅主题消息中获取相应键值数据
   */
  getLatestValueByTopic(topic, key) {
    const messagesForTopic = this.receivedMessages.filter(message => message.topic === topic)
    if (messagesForTopic.length > 0) {
      const messageContent = JSON.parse(messagesForTopic[0].message)
      return messageContent[key] !== undefined ? messageContent[key] : 'N/A'

    } else {
      return 'N/A' // 如果没有匹配到消息，返回 "N/A"
    }
  }

  /**
   * 更新数据数组
   */
  updateChartData() {
    const temperature = this.getLatestValueByTopic('temp_hum/emqx', 'temp');
    const humidity = this.getLatestValueByTopic('temp_hum/emqx', 'hum');
    const light = this.getLatestValueByTopic('temp_hum/emqx', 'light');
    const power = this.getLatestValueByTopic('temp_hum/emqx', 'power');
    // 判断是否要添加数据
    if (temperature !== 'N/A' && humidity !== 'N/A' && light !== 'N/A' && power !== 'N/A') {
      const currentTime = new Date();
      const currentTimeString = currentTime.toISOString();

      // 删除旧数据
      this.temperatureData = this.temperatureData.slice(-10);
      this.humidityData = this.humidityData.slice(-10);
      this.lightingData = this.lightingData.slice(-10);
      this.powerData = this.powerData.slice(-10);

      // 判断是否是新数据
      if (!this.temperatureData.length || this.temperatureData[0].time !== currentTimeString) {
        // 添加新数据
        this.temperatureData.push({time: currentTimeString, value: temperature});
        this.humidityData.push({time: currentTimeString, value: humidity});
        this.lightingData.push({time: currentTimeString, value: light});
        this.powerData.push({time: currentTimeString, value: power});
      }
    }
  }

  /**
   * 数据处理
   */
  handleReceivedMessage(topic, message, packet) {
    this.receivedMessages.unshift({
      topic,
      message: message.toString(),
      qos: packet.qos,
      time: new Date(),
    });
  }

  updateNumber() {
    // 在连接状态改变时，将number属性的值更新为实际的连接状态
    // 如果您的PANE_LIST数组中有多个DashboardPanel对象，您可能需要进一步确定要更新的对象
    // 在这个例子中，我们简单地将第一个对象的number属性更新为当前连接状态
    PANE_LIST[3].number = this.mqttConnectionStatus;

  }
}

// 实例化类
new MqttConnection();
