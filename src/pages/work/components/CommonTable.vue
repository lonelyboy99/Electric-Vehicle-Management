<template>
  <div class="list-common-table">
    <t-form>
        <t-row justify="space-between">
          <t-space >
            <t-col>
              <t-form-item label="工单客户筛选" name="customer">
                <t-select
                  v-model="selectedCustomer"
                  :options="CUSTOMER"
                  class="form-item-content"
                  @change="handleSelectChange"
                />
              </t-form-item>
            </t-col>
            <t-col>
              <t-form-item label="工单状态筛选" name="state">
                <t-select
                  v-model="selectedState"
                  :options="STATE"
                  class="form-item-content"
                  @change="handleSelectChange"
                />
              </t-form-item>
            </t-col>
            <t-col>
              <t-form-item label="工单类型筛选" name="type">
                <t-select
                  v-model="selectedType"
                  :options="TYPE"
                  class="form-item-content"
                  @change="handleSelectChange"
                />
              </t-form-item>
            </t-col>
            <t-col>
              <t-button @click="handleBatchAccept" variant="base">批量承接</t-button>
            </t-col>
            <t-col>
              <t-button @click="handleBatchComplete" variant="base">批量完成</t-button>
            </t-col>
            <t-col>
              <t-button @click="handleBatchDelete" variant="base">批量删除</t-button>
            </t-col>
          </t-space>
        </t-row>
    </t-form>
    <div class="table-container">
      <t-table
        :columns="columns"
        :data="data"
        :headerAffixProps="{ offsetTop, container: getContainer }"
        :headerAffixedTop="true"
        :hover="hover"
        :loading="dataLoading"
        :pagination="pagination"
        :rowKey="rowKey"
        :verticalAlign="verticalAlign"
        @change="rehandleChange"
        @page-change="rehandlePageChange"
        :selected-row-keys="selectedRowKeys"
        @select-change="rehandleSelectChange"
      >
        <template #state="{ row }">
          <t-tag v-if="row.state === '未承接'" theme="danger" variant="light">
            <icon name="error-triangle" style="margin-bottom: 3px"/>
            未承接
          </t-tag>
          <t-tag v-if="row.state === '已完成'" theme="success" variant="light">
            <icon name="check-circle" style="margin-bottom: 3px"/>
            已完成
          </t-tag>
          <t-tag v-if="row.state === '已承接但未完成'" theme="primary" variant="light">
            <icon name="shield-error" style="margin-bottom: 3px"/>
            已承接但未完成
          </t-tag>
        </template>
        <template #priority="{ row }">
          <t-tag v-if="row.priority === '紧急且重要'" theme="danger" variant="dark">紧急且重要</t-tag>
          <t-tag v-if="row.priority === '高'" theme="warning" variant="dark">高</t-tag>
          <t-tag v-if="row.priority === '中'" theme="primary" variant="dark">中</t-tag>
          <t-tag v-if="row.priority === '低'" theme="success" variant="dark">低</t-tag>
        </template>
        <template #type="{ row }">
          <t-tag v-if="row.type === '服务'" shape="round" theme="success" variant="outline">服务</t-tag>
          <t-tag v-if="row.type === '维修'" shape="round" theme="danger" variant="outline">维修</t-tag>
          <t-tag v-if="row.type === '安装'" shape="round" theme="primary" variant="outline">安装</t-tag>
        </template>
        <template #op="slotProps">
          <t-popconfirm :on-confirm="() => handleUpdate(slotProps.row,'已承接但未完成')"
                        :popupProps="{ placement: 'top' }"
                        content="确认承接工单吗"
                        theme="default"
          >
            <a class="t-button-link">承接</a>
          </t-popconfirm>
          <t-popconfirm :on-confirm="() => handleUpdate(slotProps.row,'已完成')"
                        :popupProps="{ placement: 'top' }"
                        content="确认工单完成吗"
                        theme="default"
          >
            <a class="t-button-link">完成</a>
          </t-popconfirm>
          <t-popconfirm :on-confirm="() => handleDelete(slotProps.row)"
                        :popupProps="{ placement: 'top' }"
                        content="确认删除工单吗"
                        theme="danger"
          >
            <a class="t-button-link" style="color: red">删除</a>
          </t-popconfirm>
        </template>
      </t-table>
    </div>
  </div>
</template>
<script>
import {prefix} from '@/config/global';
import Trend from '@/components/trend/index.vue';
import axios from 'axios'; // 导入 Axios 库
import {Icon} from 'tdesign-icons-vue';

export default {
  name: 'list-table',
  visible: true,
  components: {
    Trend,
    Icon
  },
  data() {
    return {
      prefix,
      timerId: null,
      selectedRowKeys: [],
      CUSTOMER: [],
      STATE: [],
      TYPE: [],
      selectedCustomer: '全部客户',
      selectedState: '全部状态',
      selectedType: '全部类型',
      data: [],
      dataLoading: true,
      deleteLoading: true,
      value: 'first',
      columns: [
        {colKey: 'row-select', type: 'multiple', width: 20, fixed: 'left'},
        {
          title: '工单号',
          width: 330,
          ellipsis: true,
          colKey: 'id',
          fixed: 'left',
          attrs: {
            style: {
              fontWeight: 600,
            },
          },
        },
        {
          title: '创建日期',
          align: 'center',
          width: 150,
          ellipsis: true,
          colKey: 'build_date',
        },
        {
          title: '创建人',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'build_man',
        },
        {
          title: '状态',
          align: 'center',
          width: 160,
          ellipsis: true,
          colKey: 'state',
        },
        {
          title: '优先级',
          align: 'center',
          width: 110,
          ellipsis: true,
          colKey: 'priority',
        },
        {
          title: '客户信息',
          align: 'center',
          width: 160,
          ellipsis: true,
          colKey: 'customer',
        },
        {
          title: '工单类型',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'type',
        },
        {
          title: '负责人',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'head',
        },
        {
          title: '预计完成日期',
          align: 'center',
          width: 150,
          ellipsis: true,
          colKey: 'fin_date',
        },
        {
          title: '备注',
          width: 300,
          ellipsis: true,
          colKey: 'notes',
        },
        {
          align: 'center',
          fixed: 'right',
          width: 300,
          colKey: 'op',
          title: '操作',
        },
      ],
      rowKey: 'id',
      tableLayout: 'auto',
      verticalAlign: 'middle',
      hover: true,
      rowClassName: (rowKey) => `${rowKey}-class`,
      // 与pagination对齐
      pagination: {
        defaultPageSize: 10,
        total: 1,
        defaultCurrent: 1,
      },
      confirmVisible: false,
      deleteIdx: -1,
    };
  },
  watch: {},
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
        const response1 = await axios.get('http://localhost:8026/api/work_order/items');
        this.orderData = response1.data;
        // 遍历orderData数组，去重
        // 第一步筛选客户名称数组
        const uniqueCustomers = this.orderData.filter((item, index, self) => {
          return self.findIndex(el => el.customer === item.customer) === index;
        });

        // 客户名称数组
        this.CUSTOMER = [
          { label: '全部客户', value: '全部客户' },
          ...new Set(uniqueCustomers.map(item => ({
            label: item.customer,
            value: item.customer,
          })))
        ];

        // 第二步筛选订单状态数组
        const uniqueStates = this.orderData.filter((item, index, self) => {
          return self.findIndex(el => el.state === item.state) === index;
        });

        // 订单状态数组
        this.STATE = [
          { label: '全部状态', value: '全部状态' },
          ...new Set(uniqueStates.map(item => ({
            label: item.state,
            value: item.state,
          })))
        ];

        // 第三步筛选订单类型数组
        const uniqueTypes = this.orderData.filter((item, index, self) => {
          return self.findIndex(el => el.type === item.type) === index;
        });

        // 订单类型数组
        this.TYPE = [
          { label: '全部类型', value: '全部类型' },
          ...new Set(uniqueTypes.map(item => ({
            label: item.type,
            value: item.type,
          })))
        ];
        let queryString = '';

        if (this.selectedCustomer && this.selectedCustomer !== '全部客户') {
          queryString += `?customer=${encodeURIComponent(this.selectedCustomer)}`;
        }

        if (this.selectedState && this.selectedState !== '全部状态') {
          queryString += queryString ? `&state=${encodeURIComponent(this.selectedState)}` : `?state=${encodeURIComponent(this.selectedState)}`;
        }
        if (this.selectedType && this.selectedType !== '全部类型') {
          queryString += queryString ? `&type=${encodeURIComponent(this.selectedType)}` : `?type=${encodeURIComponent(this.selectedType)}`;
        }

        const response = await axios.get(`http://localhost:8026/api/work_order/items${queryString}`);
        this.data = response.data;
        // 遍历 data 数组，格式化 up_timestamp 字段
        this.data.forEach(item => {
          item.build_date = this.formatTimestamp(item.build_date);
          item.fin_date = this.formatTimestamp(item.fin_date);
        });
        // 按照 build_date 字段倒序排列
        this.data.sort((a, b) => {
          const dateA = new Date(a.build_date).getTime();
          const dateB = new Date(b.build_date).getTime();
          return dateB - dateA;
        });
        this.pagination.total = this.data.length; // 更新 total 属性
        this.dataLoading = false;
      } catch (error) {
        console.error('获取数据时出错', error);
      }
    },

    async deleteItem(id) {
      try {
        await axios.delete(`http://localhost:8026/api/work_order/items/${id}`);
        await this.fetchData();
        console.log('工单删除成功', id);
      } catch (error) {
        console.error('Error deleting item', error);
      }
    },
    async updateItem(id, status) {
      try {
        await axios.put(`http://localhost:8026/api/work_order/items/${id}`, {data: {state: status}});
        await this.fetchData();
        console.log('状态修改成功', id);
      } catch (error) {
        console.error('Error updating item', error);
      }
    },
    handleUpdate(row, status) {
      console.log('正在修改行', row);
      const {id} = row;
      this.updateItem(id, status);
    },
    handleDelete(row) {
      console.log('正在删除行:', row);
      // 处理删除操作
      const {id} = row;
      this.deleteItem(id);
    },
    handleSelectChange() {
      // 在项目选择更改时触发数据获取
      this.dataLoading = true;
      this.fetchData();
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    // 批量承接
    handleBatchAccept() {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择要承接的工单');
        return;
      }

      // 遍历 selectedRowKeys 数组，对每个选中的行执行批量承接操作
      this.selectedRowKeys.forEach(key => {
        const selectedRow = this.data.find(row => row[this.rowKey] === key);
        if (selectedRow) {
          // 调用单个承接操作函数
          this.handleUpdate(selectedRow, '已承接但未完成');
        }
      });

      // 批量承接完成后，清空选中的行
      this.selectedRowKeys = [];
    },

    // 批量完成
    handleBatchComplete() {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择要完成的工单');
        return;
      }

      // 遍历 selectedRowKeys 数组，对每个选中的行执行批量完成操作
      this.selectedRowKeys.forEach(key => {
        const selectedRow = this.data.find(row => row[this.rowKey] === key);
        if (selectedRow) {
          // 调用单个完成操作函数
          this.handleUpdate(selectedRow, '已完成');
        }
      });

      // 批量完成完成后，清空选中的行
      this.selectedRowKeys = [];
    },

    // 批量删除
    handleBatchDelete() {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请选择要删除的工单');
        return;
      }

      // 遍历 selectedRowKeys 数组，对每个选中的行执行批量删除操作
      this.selectedRowKeys.forEach(key => {
        const selectedRow = this.data.find(row => row[this.rowKey] === key);
        if (selectedRow) {
          // 调用单个删除操作函数
          this.handleDelete(selectedRow);
        }
      });

      // 批量删除完成后，清空选中的行
      this.selectedRowKeys = [];
    },
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    onReset(data) {
      console.log(data);
    },
    onSubmit(data) {
      console.log(data);
    },
    rehandlePageChange(curr, pageInfo) {
      console.log('分页变化', curr, pageInfo);
    },
    rehandleChange(changeParams, triggerAndData) {
      console.log('统一Change', changeParams, triggerAndData);
    },
    rehandleClickOp({text, row}) {
      console.log(text, row);
    },
    rehandleSelectChange(value, { selectedRowData }) {
      this.selectedRowKeys = value;
      console.log(value, selectedRowData);
    },
    handleClickDelete(row) {
      this.deleteIdx = row.rowIndex;
      this.confirmVisible = true;
    },
    onConfirmDelete() {
      // 真实业务请发起请求
      this.data.splice(this.deleteIdx, 1);
      this.pagination.total = this.data.length;
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
    beforeDestroy() {
      clearInterval(this.timerId);
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
