<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-button variant="base" :disabled="!selectedRowKeys.length"> 导出灯具信息</t-button>
          <p v-if="!!selectedRowKeys.length" class="selected-count">已选{{ selectedRowKeys.length }}项</p>
        </div>
        <t-input v-model="searchValue" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
          <template #suffix-icon>
            <search-icon size="20px"/>
          </template>
        </t-input>
      </t-row>

      <div class="table-container">
        <t-table
          :columns="columns"
          :data="tableData"
          :rowKey="rowKey"
          :verticalAlign="verticalAlign"
          :hover="hover"
          :pagination="pagination"
          :selected-row-keys="selectedRowKeys"
          :loading="dataLoading"
          @page-change="rehandlePageChange"
          @change="rehandleChange"
          @select-change="rehandleSelectChange"
          :headerAffixedTop="true"
          :headerAffixProps="{ offsetTop: offsetTop, container: getContainer }"
        >
          <template #op="slotProps">
            <a class="t-button-link">查看</a>
            <a class="t-button-link">操作配置</a>
            <a class="t-button-link">编辑</a>
            <a class="t-button-link">预设情景</a>
            <a class="t-button-link" @click="handleClickDelete(slotProps)">删除</a>
          </template>
        </t-table>
      </div>
    </t-card>
    <t-dialog
      header="确认删除当前所选灯具信息？"
      :body="confirmBody"
      :visible.sync="confirmVisible"
      @confirm="onConfirmDelete"
      :onCancel="onCancel"
    >
    </t-dialog>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {SearchIcon} from 'tdesign-icons-vue';
import Trend from '@/components/trend/index.vue';
import {prefix} from '@/config/global';
import mqtt from 'mqtt';
import {CONTRACT_STATUS, CONTRACT_STATUS_OPTIONS, CONTRACT_TYPES, CONTRACT_PAYMENT_TYPES} from '@/constants';

export default Vue.extend({
  name: 'ListBase',
  components: {
    SearchIcon,
    Trend,
  },
  data() {
    return {
      CONTRACT_STATUS,
      CONTRACT_STATUS_OPTIONS,
      CONTRACT_TYPES,
      CONTRACT_PAYMENT_TYPES,
      prefix,
      dataLoading: false,
      data: [],
      receivedMessages: [],
      selectedRowKeys: [1],
      value: 'first',
      tableData: [],
      columns: [
        {colKey: 'row-select', type: 'multiple', width: 20, fixed: 'left'},
        {
          title: 'UUID',
          align: 'left',
          width: 60,
          ellipsis: true,
          colKey: 'UUID',
          fixed: 'left',
        },
        {
          title: '区',
          width: 30,
          ellipsis: true,
          colKey: 'area',
        },
        {
          title: '组',
          width: 30,
          ellipsis: true,
          colKey: 'group',
        },
        {
          title: '号',
          width: 30,
          ellipsis: true,
          colKey: 'mark',
        },
        {
          title: '网关',
          width: 80,
          ellipsis: true,
          colKey: 'gateway',
        },
        {
          title: '当前亮度',
          width: 40,
          ellipsis: true,
          colKey: 'location',
        },
        {
          title: '当前色温',
          width: 40,
          ellipsis: true,
          colKey: 'account',
        },
        {
          title: '单灯功率',
          width: 40,
          ellipsis: true,
          colKey: 'username',
        },
        {
          title: '用户名',
          width: 40,
          ellipsis: true,
          colKey: 'customer',
        },
        {
          align: 'center',
          fixed: 'right',
          width: 100,
          colKey: 'op',
          title: '操作',
        },
      ],
      rowKey: 'index',
      tableLayout: 'auto',
      verticalAlign: 'top',
      hover: true,
      rowClassName: (rowKey: string) => `${rowKey}-class`,
      // 与pagination对齐
      pagination: {
        defaultPageSize: 20,
        total: 0,
        defaultCurrent: 1,
      },
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
    };
  },
  computed: {
    confirmBody() {
      if (this.deleteIdx > -1) {
        const {UUID} = this.data?.[this.deleteIdx];
        return `删除后，${UUID}的所有信息将被清空，且无法恢复`;
      }
      return '';
    },
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    this.dataLoading = true;
    // this.$request
    //   .get('/api/get-list')
    //   .then((res) => {
    //     if (res.code === 0) {
    //       const { list = [] } = res.data;
    //       this.data = list;
    //       this.pagination = {
    //         ...this.pagination,
    //         total: list.length,
    //       };
    //     }
    //   })
    //   .catch((e: Error) => {
    //     console.log(e);
    //   })
    //   .finally(() => {
    //     this.dataLoading = false;
    //   });
    this.initMqtt();
    this.updateChartData();
    this.chartUpdateInterval = setInterval(() => {
      this.updateChartData();
    }, 100);
  },

  methods: {
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    rehandlePageChange(curr, pageInfo) {
      console.log('分页变化', curr, pageInfo);
    },
    rehandleSelectChange(selectedRowKeys: number[]) {
      this.selectedRowKeys = selectedRowKeys;
    },
    rehandleChange(changeParams, triggerAndData) {
      console.log('统一Change', changeParams, triggerAndData);
    },
    handleClickDetail() {
      this.$router.push('/detail/base');
    },
    handleSetupContract() {
      this.$router.push('/form/base');
    },
    handleClickDelete(row: { rowIndex: any }) {
      this.deleteIdx = row.rowIndex;
      this.confirmVisible = true;
    },
    onConfirmDelete() {
      // 真实业务请发起请求
      this.data.splice(this.deleteIdx, 1);
      this.pagination.total = this.data.length;
      const selectedIdx = this.selectedRowKeys.indexOf(this.deleteIdx);
      if (selectedIdx > -1) {
        this.selectedRowKeys.splice(selectedIdx, 1);
      }
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

    /**
     * 更新数据数组
     */
    updateChartData() {
      const temperature = this.getLatestValueByTopic('temp_hum/emqx', 'temp');
      const humidity = this.getLatestValueByTopic('temp_hum/emqx', 'hum');
      const light = this.getLatestValueByTopic('temp_hum/emqx', 'light');
      const power = this.getLatestValueByTopic('temp_hum/emqx', 'power');
      const id = this.getLatestValueByTopic('temp_hum/emqx', 'id');
      const lng = this.getLatestValueByTopic('temp_hum/emqx', 'lng');
      const lat = this.getLatestValueByTopic('temp_hum/emqx', 'lat');

      // 判断是否要添加数据
      if (temperature !== 'N/A' && humidity !== 'N/A' && light !== 'N/A' && power !== 'N/A') {
        const currentTime = new Date();
        const currentTimeString = currentTime.toISOString();

        // 删除旧数据
        this.temperatureData = this.temperatureData.slice(-10);
        this.humidityData = this.humidityData.slice(-10);
        this.lightingData = this.lightingData.slice(-10);
        this.powerData = this.powerData.slice(-10);
        this.idData = this.idData.slice(-10);
        this.lngData = this.lngData.slice(-10);
        this.latData = this.latData.slice(-10);

        // 判断是否是新数据
        if (!this.temperatureData.length || this.temperatureData[0].time !== currentTimeString) {
          // 添加新数据
          this.temperatureData.push({time: currentTimeString, value: temperature});
          this.humidityData.push({time: currentTimeString, value: humidity});
          this.lightingData.push({time: currentTimeString, value: light});
          this.powerData.push({time: currentTimeString, value: power});
          this.idData.push({time: currentTimeString, value: id});
          this.lngData.push({time: currentTimeString, value: lng});
          this.latData.push({time: currentTimeString, value: lat});
          this.timeData.push(currentTimeString);
        }
      }
    },
    /**
     * 数据处理
     */
    handleReceivedMessage(topic, message, packet) {
      // 解析 MQTT 消息
      const mqttData = JSON.parse(message.toString());
      // 分割 number 字符串
      const numberParts = mqttData.params.value.number.split(' ');
      // 提取你需要的部分
      const firstPart = numberParts[0];
      // 提取你需要的部分
      const secondPart = numberParts[1]; // 获取 "5B"
      // 提取数据并添加到表格数据中
      const rowData = {
        UUID: mqttData.params.value.uuid,
        area: mqttData.params.value.area,
        group: firstPart,
        mark: secondPart,
        gateway: mqttData.params.value.device_name,
        location: mqttData.params.value.current_bright,
        account: mqttData.params.value.current_cct,
        username: mqttData.params.value.power,
        customer: "坤科节能",
        // 其他字段根据需要添加
      };
      // 将数据添加到表格数据数组中
      this.tableData.unshift(rowData);
      this.dataLoading = false;
    },
    // /**
    //  * 数据处理
    //  */
    // handleReceivedMessage(topic, message, packet) {
    //   this.receivedMessages.unshift({
    //     topic,
    //     message: message.toString(),
    //     qos: packet.qos,
    //     time: new Date(),
    //   });
    //
    // },
  },
});
</script>

<style lang="less" scoped>
@import '@/style/variables';

.payment-col {
  display: flex;

  .trend-container {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
}

.left-operation-container {
  padding: 0 0 6px 0;
  margin-bottom: 16px;

  .selected-count {
    display: inline-block;
    margin-left: var(--td-comp-margin-s);
    color: var(--td-text-color-secondary);
  }
}

.search-input {
  width: 360px;
}

.t-button + .t-button {
  margin-left: var(--td-comp-margin-s);
}
</style>
