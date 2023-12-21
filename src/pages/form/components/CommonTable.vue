<template>
  <div class="list-common-table">
    <div class="table-container">
      <t-table
        :data="data"
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
          <t-popconfirm theme="danger"
                        content="确认删除工单吗"
                        :on-confirm="() => handleDelete(slotProps.row)"
                        :popupProps="{ placement: 'right' }"
          >
          <a class="t-button-link">删除</a>
          </t-popconfirm>
        </template>
      </t-table>
    </div>
  </div>
</template>
<script>
import { prefix } from '@/config/global';
import Trend from '@/components/trend/index.vue';
import axios from 'axios'; // 导入 Axios 库

export default {
  name: 'list-table',
  visible: true,
  components: {
    Trend,
  },
  data() {
    return {
      prefix,
      selectedRowKeys: [],
      data: [],
      dataLoading: true,
      deleteLoading: true,
      value: 'first',
      columns: [
        {colKey: 'row-select', type: 'multiple', width: 20, fixed: 'left'},
        {
          title: '工单号',
          align: 'left',
          width: 80,
          ellipsis: true,
          colKey: 'id',
          fixed: 'left',
        },
        {
          title: '创建日期',
          align: 'center',
          width: 200,
          ellipsis: true,
          colKey: 'up_timestamp',
        },
        {
          title: '创建人',
          width: 150,
          ellipsis: true,
          colKey: 'client_id',
        },
        {
          title: '状态',
          width: 80,
          ellipsis: true,
          colKey: 'temp',
        },
        {
          title: '优先级',
          width: 80,
          ellipsis: true,
          colKey: 'hum',
        },
        {
          title: '客户信息',
          width: 100,
          ellipsis: true,
          colKey: 'light',
        },
        {
          title: '工单类型',
          width: 100,
          ellipsis: true,
          colKey: 'power',
        },
        {
          title: '负责人',
          width: 100,
          ellipsis: true,
          colKey: 'LED',
        },
        {
          title: '预计完成日期',
          width: 200,
          ellipsis: true,
          colKey: 'lng',
        },
        {
          title: '备注',
          width: 300,
          ellipsis: true,
          colKey: 'lat',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 200,
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
  watch:{
  },
  computed: {
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    this.fetchData();
    setInterval(() => {
      this.fetchData();
    }, 5000);
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('http://localhost:3002/api/items');
        this.data = response.data;
        // 遍历 data 数组，格式化 up_timestamp 字段
        this.data.forEach(item => {
          item.up_timestamp = this.formatTimestamp(item.up_timestamp);
        });
        this.pagination.total = this.data.length; // 更新 total 属性
        this.dataLoading= false;
      } catch (error) {
        console.error('Error fetching data', error);
      }
    },

    async addItem(item) {
      try {
        await axios.post('http://localhost:3002/api/items', { data: item });
        this.fetchData();
      } catch (error) {
        console.error('Error adding item', error);
      }
    },

    async updateItem(item) {
      try {
        await axios.put(`http://localhost:3002/api/items/${item.id}`, { data: item });
        this.fetchData();
      } catch (error) {
        console.error('Error updating item', error);
      }
    },

    async deleteItem(id) {
      try {
        await axios.delete(`http://localhost:3002/api/items/${id}`);
        await this.fetchData();
        console.log('工单删除成功', id);
      } catch (error) {
        console.error('Error deleting item', error);
      }
    },
    handleManage(row) {
      // 处理管理操作，可以根据需要进行相关操作
      console.log('Manage clicked for row:', row);
    },

    handleDelete(row) {
      console.log('正在删除行:', row);
      // 处理删除操作
      const { id } = row;
      this.deleteItem(id);
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
    rehandleClickOp({ text, row }) {
      console.log(text, row);
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
