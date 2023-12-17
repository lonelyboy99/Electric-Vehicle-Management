<template>
  <div class="list-common-table">
    <t-form
      ref="form"
      :data="formData"
      :label-width="80"
      colon
      @reset="onReset"
      @submit="onSubmit"
      :style="{ marginBottom: '8px' }"
    >
      <t-row>
        <t-col :span="10">
          <t-row :gutter="[16, 24]">
            <t-col :flex="1">
              <t-form-item label="UUID" name="name">
                <t-input
                  v-model="formData.name"
                  class="form-item-content"
                  type="search"
                  placeholder="请输入设备UUID"
                  :style="{ minWidth: '134px' }"
                />
              </t-form-item>
            </t-col>
            <t-col :flex="1">
              <t-form-item label="区号" name="status">
                <t-select
                  v-model="formData.status"
                  class="form-item-content`"
                  :options="CONTRACT_STATUS_OPTIONS"
                  placeholder="请选择区号"
                />
              </t-form-item>
            </t-col>
            <t-col :flex="1">
              <t-form-item label="组号" name="no">
                <t-input
                  v-model="formData.no"
                  class="form-item-content"
                  placeholder="请输入组号"
                  :style="{ minWidth: '134px' }"
                />
              </t-form-item>
            </t-col>
            <t-col :flex="1">
              <t-form-item label="网关" name="type">
                <t-select
                  v-model="formData.type"
                  class="form-item-content`"
                  :options="CONTRACT_TYPE_OPTIONS"
                  placeholder="请选择网关"
                />
              </t-form-item>
            </t-col>
          </t-row>
        </t-col>
        <t-col :span="2" class="operation-container">
          <t-button theme="primary" type="submit" :style="{ marginLeft: '8px' }"> 查询 </t-button>
          <t-button type="reset" variant="base" theme="default"> 重置 </t-button>
        </t-col>
      </t-row>
    </t-form>
    <t-form
      ref="form"
      :data="formData"
      :label-width="80"
      colon
      @reset="onReset"
      @submit="onSubmit"
      :style="{ marginBottom: '8px' }"
    >
      <t-row>
        <t-col :span="10">
          <t-row :gutter="[16, 24]">
            <t-col>
              <t-form-item label="灯控操作" name="status">
                <t-select
                  v-model="formData.status"
                  class="form-item-content`"
                  :options="CONTRACT_STATUS_OPTIONS"
                  placeholder="请选择操作类型"
                />
              </t-form-item>
            </t-col>
            <t-col>
              <t-form-item label="网关" name="status">
                <t-select
                  v-model="formData.status"
                  class="form-item-content`"
                  :options="CONTRACT_STATUS_OPTIONS"
                  placeholder="请选择操作类型"
                />
              </t-form-item>
            </t-col>
            <t-col>
            <t-button theme="primary" type="submit" :style="{ marginLeft: '8px' }"> 常亮</t-button>
            <t-button type="reset" variant="base"> 常灭</t-button>
            <t-button type="reset" variant="base"> 闪一闪 </t-button>
            <t-button type="reset" variant="base"> 停止闪</t-button>
            <t-button type="reset" variant="base"> 休眠 </t-button>
            <t-button type="reset" variant="base"> 更多操作 </t-button>
        </t-col>
          </t-row>
        </t-col>
      </t-row>
    </t-form>
    <div class="table-container">
      <t-table
        :data="tableData"
        :columns="columns"
        :rowKey="rowKey"
        :verticalAlign="verticalAlign"
        :hover="hover"
        :pagination="pagination"
        @page-change="rehandlePageChange"
        @change="rehandleChange"
        :loading="dataLoading"
        :headerAffixedTop="true"
        :headerAffixProps="{ offsetTop, container: getContainer }"
      >
        <template #op="slotProps">
          <a class="t-button-link" @click="rehandleClickOp(slotProps)">管理</a>
          <a class="t-button-link" @click="handleClickDelete(slotProps)">删除</a>
        </template>
      </t-table>
      <t-dialog
        header="确认删除当前所选合同？"
        :body="confirmBody"
        :visible.sync="confirmVisible"
        @confirm="onConfirmDelete"
        :onCancel="onCancel"
      >
      </t-dialog>
    </div>
  </div>
</template>
<script>
import { prefix } from '@/config/global';
import Trend from '@/components/trend/index.vue';

import {
  CONTRACT_STATUS,
  CONTRACT_STATUS_OPTIONS,
  CONTRACT_TYPES,
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_PAYMENT_TYPES,
} from '@/constants';
import mqtt from "mqtt";

export default {
  name: 'list-table',
  components: {
    Trend,
  },
  data() {
    return {
      CONTRACT_STATUS,
      CONTRACT_STATUS_OPTIONS,
      CONTRACT_TYPES,
      CONTRACT_TYPE_OPTIONS,
      CONTRACT_PAYMENT_TYPES,
      prefix,
      formData: {
        name: '',
        no: undefined,
        status: undefined,
      },
      selectedRowKeys: [1],
      data: [],
      receivedMessages: [],
      tableData: [],
      dataLoading: false,
      value: 'first',
      columns: [
        {colKey: 'row-select', type: 'multiple', width: 20, fixed: 'left'},
        {
          title: 'UUID',
          align: 'left',
          width: 200,
          ellipsis: true,
          colKey: 'uuid',
          fixed: 'left',
        },
        {
          title: '区',
          width: 80,
          ellipsis: true,
          colKey: 'area',
        },
        {
          title: '组',
          width: 80,
          ellipsis: true,
          colKey: 'cluster',
        },
        {
          title: '号',
          width: 80,
          ellipsis: true,
          colKey: 'number',
        },
        {
          title: '情景模式',
          width: 100,
          ellipsis: true,
          colKey: 'scene_no',
        },
        {
          title: '亮灯模式',
          width: 100,
          ellipsis: true,
          colKey: 'light_mode',
        },
        {
          title: '能耗(千瓦时)',
          width: 130,
          ellipsis: true,
          colKey: 'energy_dur',
        },
        {
          title: '功率(瓦)',
          width: 100,
          ellipsis: true,
          colKey: 'power',
        },
        {
          title: '能耗更新时间',
          width: 120,
          ellipsis: true,
          colKey: 'ConsumptionUpdate',
        },
        {
          title: '当前亮度',
          width: 100,
          ellipsis: true,
          colKey: 'current_bright',
        },
        {
          title: '有人亮度',
          width: 100,
          ellipsis: true,
          colKey: 'high_bright',
        },
        {
          title: '无人亮度',
          width: 100,
          ellipsis: true,
          colKey: 'standby_bright',
        },
        {
          title: '色温',
          width: 100,
          ellipsis: true,
          colKey: 'current_cct',
        },
        {
          title: '感应模式',
          width: 100,
          ellipsis: true,
          colKey: 'delay_mode',
        },
        {
          title: '一段延时',
          width: 100,
          ellipsis: true,
          colKey: 'delay_time',
        },
        {
          title: '二段延时',
          width: 100,
          ellipsis: true,
          colKey: 'delay_time2',
        },
        {
          title: '设备更新时间',
          width: 200,
          ellipsis: true,
          colKey: 'time_dur',
        },
        {
          align: 'center',
          fixed: 'right',
          width: 200,
          colKey: 'op',
          title: '操作',
        },
      ],
      rowKey: 'index',
      tableLayout: 'auto',
      verticalAlign: 'middle',
      hover: true,
      rowClassName: (rowKey) => `${rowKey}-class`,
      // 与pagination对齐
      pagination: {
        defaultPageSize: 20,
        total: 1000,
        defaultCurrent: 1,
      },
      confirmVisible: false,
      deleteIdx: -1,
    };
  },
  computed: {
    confirmBody() {
      if (this.deleteIdx > -1) {
        const { uuid } = this.tableData?.[this.deleteIdx];
        return `删除后，${uuid}的所有合同信息将被清空，且无法恢复`;
      }
      return '';
    },
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    this.dataLoading = true;
    this.initMqtt();
    setInterval(() => {
      this.pagination.total = this.tableData.length;
    }, 100);

  },
  methods: {
    convertUnixTimestampToDateTime(unixTimestamp) {
      const dateTime = new Date(unixTimestamp * 1000); // 转换为毫秒
      return dateTime.toLocaleString();
    },
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    onReset(tableData) {
      console.log(tableData);
    },
    onSubmit(tableData) {
      console.log(tableData);
    },
    rehandlePageChange(curr, pageInfo) {
      console.log('分页变化', curr, pageInfo);
    },
    rehandleChange(changeParams, triggerAndData) {
      console.log('统一Change', changeParams, triggerAndData);
    },
    rehandleClickOp({ text, row }) {
      console.log(text, row);
    },
    handleClickDelete(row) {
      this.deleteIdx = row.rowIndex;
      this.confirmVisible = true;
    },
    onConfirmDelete() {
      // 真实业务请发起请求
      this.tableData.splice(this.deleteIdx, 1);
      this.pagination.total = this.tableData.length;
      this.confirmVisible = false;
      this.$message.success('删除成功');
      this.resetIdx();
    },
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },

    /**
     * MQTT连接函数
     */
    initMqtt() {
      // 连接配置选项
      let options = {
        connectTimeout: 4000, // 超时时间
        clientId: '', // 不填默认随机生成一个ID
      }
      this.client = mqtt.connect('ws://106.15.121.181:8083/mqtt', options)
      this.client1 = mqtt.connect('ws://122.51.210.27:8083/mqtt', options)

      // 连接成功
      this.client.on('connect', () => {
        this.mqttConnectionStatus = '已连接';
        console.log('连接成功');

        // 连接成功后订阅消息
        this.subscribes();
      });

      // 重连提醒
      this.client.on('reconnect', () => {
        this.mqttConnectionStatus = '正在重连';
        console.log('正在重连');
      });

      // 连接失败提醒
      this.client.on('error', (error) => {
        this.mqttConnectionStatus = '连接失败';
        console.log('连接失败', error);
      });
    },

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
      const arr1 = ['led/emqx', 'temp_hum/emqx']
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
    },

    /**
     * MQTT发布信息
     */
    publish(topic, message) {
      if (!this.client.connected) {
        console.log('客户端未连接')
        return
      }
      this.client.publish(topic, message, {qos: 0}, (err) => {
        if (!err) {
          console.log(`主题为：${topic},内容为：${message} 发布成功`)
        }
      })
    },

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
    },

    // /**
    //  * 更新数据数组
    //  */
    // updateChartData() {
    //   const temperature = this.getLatestValueByTopic('temp_hum/emqx', 'temp');
    //   const humidity = this.getLatestValueByTopic('temp_hum/emqx', 'hum');
    //   const light = this.getLatestValueByTopic('temp_hum/emqx', 'light');
    //   const power = this.getLatestValueByTopic('temp_hum/emqx', 'power');
    //   const id = this.getLatestValueByTopic('temp_hum/emqx', 'id');
    //   const lng = this.getLatestValueByTopic('temp_hum/emqx', 'lng');
    //   const lat = this.getLatestValueByTopic('temp_hum/emqx', 'lat');
    //
    //   // 判断是否要添加数据
    //   if (temperature !== 'N/A' && humidity !== 'N/A' && light !== 'N/A' && power !== 'N/A') {
    //     const currentTime = new Date();
    //     const currentTimeString = currentTime.toISOString();
    //
    //     // 删除旧数据
    //     this.temperatureData = this.temperatureData.slice(-10);
    //     this.humidityData = this.humidityData.slice(-10);
    //     this.lightingData = this.lightingData.slice(-10);
    //     this.powerData = this.powerData.slice(-10);
    //     this.idData = this.idData.slice(-10);
    //     this.lngData = this.lngData.slice(-10);
    //     this.latData = this.latData.slice(-10);
    //
    //     // 判断是否是新数据
    //     if (!this.temperatureData.length || this.temperatureData[0].time !== currentTimeString) {
    //       // 添加新数据
    //       this.temperatureData.push({time: currentTimeString, value: temperature});
    //       this.humidityData.push({time: currentTimeString, value: humidity});
    //       this.lightingData.push({time: currentTimeString, value: light});
    //       this.powerData.push({time: currentTimeString, value: power});
    //       this.idData.push({time: currentTimeString, value: id});
    //       this.lngData.push({time: currentTimeString, value: lng});
    //       this.latData.push({time: currentTimeString, value: lat});
    //       this.timeData.push(currentTimeString);
    //     }
    //   }
    // },
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
        power: mqttData.params.value.power,
        ConsumptionUpdate: "",
        current_bright: mqttData.params.value.current_bright,
        high_bright: mqttData.params.value.high_bright,
        standby_bright: mqttData.params.value.standby_bright,
        current_cct: mqttData.params.value.current_cct,
        delay_mode: mqttData.params.value.delay_mode,
        delay_time: this.convertUnixTimestampToDateTime(mqttData.params.value.delay_time),
        delay_time2: this.convertUnixTimestampToDateTime(mqttData.params.value.delay_time2),
        time_dur: this.convertUnixTimestampToDateTime(mqttData.params.value.time_dur),
        customer: "坤科节能",
      };
      // 将数据添加到表格数据数组中
      this.tableData.unshift(rowData);
      this.dataLoading = false;
    },
  },
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.list-common-table {
  background-color: var(--td-bg-color-container);
  padding: 30px 32px;
  border-radius: var(--td-radius-default);
}

.form-item-content {
  width: 100%;
}

.operation-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.payment-col {
  display: flex;

  .trend-container {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
}
.t-button + .t-button {
  margin-left: var(--td-comp-margin-s);
}
</style>
