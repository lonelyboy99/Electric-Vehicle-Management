import mqtt from "mqtt";

/**
 * MQTT部分
 */
export class MqttConnection {
  client: mqtt.MqttClient;
  client1: mqtt.MqttClient;
  mqttConnectionStatus: string;
  receivedMessages: Array<any>;
  temperatureData: Array<{ time: string; value: string }> = [];
  humidityData: Array<{ time: string; value: string }> = [];
  lightingData: Array<{ time: string; value: string }> = [];
  powerData: Array<{ time: string; value: string }> = [];
  tableData: Array<any> = [];


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
    this.client = mqtt.connect('ws://106.15.121.181:8083/mqtt', options)
    this.client1 = mqtt.connect('ws://122.51.210.27:8083/mqtt', options)
    this.client.on('connect', () => {
      this.mqttConnectionStatus = '已连接';
      console.log('连接成功');

      // 连接成功后订阅消息
      this.subscribes();
      // 更新number属性的值为实际的连接状态
    });

    // 重连提醒
    this.client.on('reconnect', () => {
      this.mqttConnectionStatus = '正在重连';
      console.log('正在重连');
      // 更新number属性的值为实际的连接状态
    });

    // 连接失败提醒
    this.client.on('error', (error) => {
      this.mqttConnectionStatus = '连接失败';
      console.log('连接失败', error);
      // 更新number属性的值为实际的连接状态
    });
  }

  /**
   * MQTT订阅函数(订阅多个信息)
   */
  subscribes() {
    const arr = ['/sys/ibms_shgh_zm/gs08291110/thing/event/current/post', '/sys/ibms_shgh_zm/gs08291110/thing/event/consumption/post']
    this.client.subscribe(arr, {qos: 1}, (err) => {
      if (!err) {
        console.log(`主题为：“${arr}” 的消息订阅成功`)
      } else {
        console.log('消息订阅失败')
      }
    })
    const arr1 = ['led/emqx', 'temp_hum/emqx', 'online/emqx']
    this.client1.subscribe(arr1, {qos: 1}, (err) => {
      if (!err) {
        console.log(`主题为：“${arr1}” 的消息订阅成功`)
      } else {
        console.log('消息订阅失败')
      }
    })
    // 在订阅成功后更新 receivedMessages 数组
    this.client.on('message', function (topic, message, packet) {
      this.handleReceivedMessage(topic, message, packet);
      console.log(`接收到消息，主题：${topic}, 消息：${message.toString()}`);
    }.bind(this));

    this.client1.on('message', function (topic, message, packet) {
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
   * 数据处理
   */
  handleReceivedMessage(topic, message, packet) {

    // 解析 MQTT 消息
    const mqttData = JSON.parse(message.toString());
    // 去除空格并将十六进制字符串转换为十进制数字
    const decimalNumber = parseInt(mqttData.params.value.number.replace(/\s/g, ""), 16);
    // 提取数据并添加到表格数据中
    const rowData = {
      uuid: mqttData.params.value.uuid,
      area: mqttData.params.value.area,
      cluster: mqttData.params.value.cluster,
      number: decimalNumber,
      scene_no: mqttData.params.value.scene_no,
      light_mode: mqttData.params.value.light_mode,
      energy_dur: mqttData.params.value.energy_dur,
      device_name: mqttData.params.value.device_name,
      power: mqttData.params.value.power,
      ConsumptionUpdate: "",
      current_bright: mqttData.params.value.current_bright,
      high_bright: mqttData.params.value.high_bright,
      standby_bright: mqttData.params.value.standby_bright,
      current_cct: mqttData.params.value.current_cct,
      delay_mode: mqttData.params.value.delay_mode,
      delay_time: mqttData.params.value.delay_time,
      delay_time2: mqttData.params.value.delay_time2,
      time_dur: mqttData.params.value.time_dur,
      customer: "坤科节能",
    };
    // 将数据添加到表格数据数组中
    this.tableData.unshift(rowData);
  }
}
