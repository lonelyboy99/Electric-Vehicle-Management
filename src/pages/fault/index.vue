<template>
  <div>
    <t-card :bordered="false" class="list-card-container">
      <div class="table-container">
        <t-table
          :columns="columns"
          :data="data"
          :headerAffixProps="{ offsetTop: offsetTop, container: getContainer }"
          :headerAffixedTop="true"
          :hover="hover"
          :loading="dataLoading"
          :pagination="pagination"
          :row-key="rowKey"
          :selected-row-keys="selectedRowKeys"
          :stripe="true"
          :verticalAlign="verticalAlign"
          @change="rehandleChange"
          @page-change="rehandlePageChange"
          @select-change="rehandleSelectChange"
        >
        </t-table>
      </div>
    </t-card>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {prefix} from '@/config/global';
import axios from "axios";
import {v4 as uuidv4} from 'uuid';

export default Vue.extend({
  data() {
    return {
      timerId: null,
      prefix,
      dataLoading: false,
      receivedMessages: [],
      selectedRowKeys: [],
      value: 'first',
      devicesWithAlertSent: new Set(),
      data: [],
      columns: [
        {colKey: 'serial-number', width: '100', title: '序号'},
        {
          title: '网关',
          width: 'auto',
          align: 'left',
          ellipsis: true,
          colKey: 'device_name',
          attrs: {
            style: {
              fontWeight: 600,
            },
          },
        },
        {
          title: '区-组-号',
          width: 'auto',
          align: 'left',
          ellipsis: true,
          colKey: 'areaUpdate',
        },
        {
          title: '所属项目',
          width: 'auto',
          align: 'left',
          ellipsis: true,
          colKey: 'project',
        },
        {
          title: '所属区域',
          width: 'auto',
          align: 'left',
          ellipsis: true,
          colKey: 'location',
        },
        {
          title: '预警原因',
          width: 'auto',
          align: 'left',
          ellipsis: true,
          colKey: 'warning',
          attrs: {
            style: {
              fontWeight: 600,
              color: 'red',
            },
          },
        },
      ],
      rowKey: 'uuid',
      tableLayout: 'auto',
      verticalAlign: 'middle',
      bordered: true,
      hover: true,
      rowClassName: (rowKey: string) => `${rowKey}-class`,
      // 与pagination对齐
      pagination: {
        defaultPageSize: 10,
        total: 1,
        defaultCurrent: 1,
      },
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
    };
  },
  computed: {
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    this.dataLoading = true;
    this.fetchData();
    this.timerId = setInterval(() => {
      this.fetchData();
    }, 1000);
  },

  methods: {
    async fetchData() {
      try {
        // 使用筛选参数进行API请求
        const response = await axios.get('http://localhost:8026/api/light_data/items');

        // 对数据进行处理，比较 ConsumptionUpdate 列和当前时间
        const currentTime = new Date();

        this.data = response.data
          .filter(item => {
            const consumptionUpdateTime = new Date(item.ConsumptionUpdate);

            // 计算时间差
            const timeDifference = currentTime.getTime() - consumptionUpdateTime.getTime();

            // 如果差值大于 2 小时的毫秒数，保留该元素
            return timeDifference > 2 * 60 * 60 * 1000;
          })
          .map(item => {
            // 更新预警原因列
            const deviceId = `${item.area}-${item.cluster}-${item.number}`;

            if (!this.devicesWithAlertSent.has(deviceId)) {
              // 如果设备还没有发送工单，就发送工单
              this.sendWorkOrder(item);

              // 将设备添加到已发送工单的集合中
              this.devicesWithAlertSent.add(deviceId);

              // 设置定时器，一段时间后清除集合中的设备
              setTimeout(() => {
                this.devicesWithAlertSent.delete(deviceId);
              }, 24 * 60 * 60 * 1000); // 设置为一天后清除 24 * 60 * 60 * 1000
            }

            return {
              ...item,
              'areaUpdate': `${item.area}-${item.cluster}-${item.number}`,
              'warning': '2小时内状态数据无更新', // 更新预警原因
            };
          });
        this.pagination.total = this.data.length; // 更新 total 属性
        this.dataLoading = false;
      } catch (error) {
        console.error('获取数据时出错', error);
      }
    },
    async sendWorkOrder(device) {
      try {
        // 先检查工单是否已经存在
        const notes = `${device.area} 区 ${device.cluster} 组 ${device.number} 号 灯具2小时未更新`;
        const checkResponse = await axios.get(`http://localhost:8026/api/work_order/check/${encodeURIComponent(notes)}/未承接`);

        if (checkResponse.data.exists) {
          console.log('工单已存在，不进行创建');
          return;
        }

        // 工单不存在，继续创建工单的逻辑
        const build_date = new Date().toISOString().split('T')[0];
        const buildDateObject = new Date(build_date);
        const fin_date = new Date(buildDateObject);
        fin_date.setDate(buildDateObject.getDate() + 3);
        const formattedFinDate = fin_date.toISOString().split('T')[0];
        const id = uuidv4();

        const dataToCreate = {
          id: id,
          customer: device.project,
          build_man: device.project,
          state: '未承接',
          build_date: build_date,
          fin_date: formattedFinDate,
          priority: '紧急且重要',
          type: '维修',
          head: device.project,
          notes: notes,
        };

        // 发送创建工单的 HTTP 请求
        const response = await axios.post(`http://localhost:8026/api/work_order/items`, {data: dataToCreate});

        // 处理响应，显示成功消息等
        console.log(response.data);
      } catch (error) {
        // 处理错误，显示错误消息等
        console.error('处理创建工单时发生错误', error);
      }
    },
    handleSelectChange() {
      // 在项目选择更改时触发数据获取
      this.dataLoading = true;
      this.fetchData();
    },
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
    handleClickDelete(row: { rowIndex: any }) {
      this.deleteIdx = row.rowIndex;
      this.confirmVisible = true;
    },
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    handleNav(url) {
      this.$router.push(url);
    },
    beforeDestroy() {
      clearInterval(this.timerId);
    },
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
