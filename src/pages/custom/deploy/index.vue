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
          <template #op="slotProps">
            <a class="t-button-link" @click="selectedFunction(slotProps.row)">查看</a>
            <a class="t-button-link" @click="editFunction(slotProps.row)">编辑</a>
            <a class="t-button-link">操作配置</a>
            <t-popconfirm :on-confirm="() => handleDelete(slotProps.row)"
                          :popupProps="{ placement: 'top' }"
                          content="确认删除项目吗"
                          theme="danger"
            >
              <a class="t-button-link" style="color: red">删除</a>
            </t-popconfirm>
          </template>
          >
        </t-table>
      </div>
    </t-card>
      <t-dialog
        :confirmBtn="null"
        :cancelBtn="null"
        :visible.sync="detailVisible"
        :header="dialogHeader"
        top="4%"
        width="1000px"
      >
        <t-tabs>
          <t-tab-panel label="灯具">
            <t-table
              :columns="columns1"
              :data="selectedProjectData"
              :headerAffixProps="{ offsetTop, container: getContainer }"
              :headerAffixedTop="true"
              :hover="hover"
              :loading="dataLoading"
              :pagination="pagination1"
              :rowKey="rowKey1"
              :verticalAlign="verticalAlign"
              @change="rehandleChange"
              @page-change="rehandlePageChange"
            >
            </t-table>
          </t-tab-panel>
          <t-tab-panel label="网关" value="second">
            <t-table
              :columns="columns2"
              :data="selectedDeviceData"
              :headerAffixedTop="true"
              :hover="hover"
              :loading="dataLoading"
              :pagination="pagination2"
              :rowKey="rowKey2"
              :verticalAlign="verticalAlign"
              @change="rehandleChange"
              @page-change="rehandlePageChange"
            >
            </t-table>
          </t-tab-panel>
        </t-tabs>
      </t-dialog>
    <t-dialog
      :confirmBtn="null"
      :cancelBtn="null"
      :visible.sync="editVisible"
      header="修改项目"
      top="4%"
      width="500px"
    >
        <t-form style="margin-top: 20px" labelAlign="left">
          <t-form-item label="项目名称">
            <t-input />
          </t-form-item>
          <t-form-item label="项目所在地">
            <t-input  placeholder="请输入项目地址"/>
          </t-form-item>
          <t-form-item label="项目描述">
            <t-input  placeholder="请输入项目描述"/>
          </t-form-item>
          <t-form-item label="紧急联系人" >
            <t-space>
            <t-input  placeholder="姓名"/>
            <t-input  placeholder="电话"/>
            </t-space>
          </t-form-item>
          <t-form-item style="margin-left: 150px">
            <t-space size="30px">
            <t-button>确定</t-button>
            <t-button>取消</t-button>
            </t-space>
          </t-form-item>
        </t-form>
    </t-dialog>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import axios from "axios";


export default Vue.extend({

  data() {
    return {
      timerId: null,
      dialogHeader: '',
      editVisible: false,
      detailVisible: false,
      selectedDeviceData: [],
      selectedProjectData: [],
      selectedProject: '',
      dataLoading: false,
      receivedMessages: [],
      selectedRowKeys: [],
      filteredData: [],
      value: 'first',
      originalData: [],
      data: [],
      columns: [
        {
          title: '项目名称',
          width: 'auto',
          ellipsis: true,
          colKey: '1',
        },
        {
          title: '省市',
          width: 'auto',
          ellipsis: true,
          colKey: 'address',
        },
        {
          title: '客户名称',
          width: 'auto',
          ellipsis: true,
          colKey: '2',
        },
        {
          title: '项目规模',
          width: 'auto',
          ellipsis: true,
          colKey: '3',
        },
        {
          title: '灯控用户数',
          width: 'auto',
          ellipsis: true,
          colKey: '4',
        },
        {
          title: '所属项目',
          width: 'auto',
          ellipsis: true,
          colKey: 'project',
        },
        {
          align: 'center',
          fixed: 'right',
          width: 300,
          colKey: 'op',
          title: '操作',
        },
      ],
      columns1: [
        {
          title: 'UUID',
          width: 200,
          ellipsis: true,
          colKey: 'uuid',
          attrs: {
            style: {
              fontWeight: 600,
            },
          },
        },
        {
          title: '区',
          width: 'auto',
          ellipsis: true,
          colKey: 'area',
          attrs: {
            style: {
              fontWeight: 600,
            },
          },
        },
        {
          title: '组',
          width: 'auto',
          ellipsis: true,
          colKey: 'cluster',
          attrs: {
            style: {
              fontWeight: 600,
            },
          },
        },
        {
          title: '号',
          width: 'auto',
          ellipsis: true,
          colKey: 'number',
          attrs: {
            style: {
              fontWeight: 600,
            },
          },
        },
        {
          title: '网关',
          width: 'auto',
          ellipsis: true,
          colKey: 'device_name',
          attrs: {
            style: {
              fontWeight: 600,
            },
          },
        },
      ],
      columns2: [
        {
          title: '网关',
          align: 'left',
          width: 'auto',
          ellipsis: true,
          colKey: 'device_name',
          fixed: 'left',
          attrs: {
            style: {
              fontWeight: 600,
            },
          },
        },
      ],
      rowKey: 'customer',
      rowKey1: 'uuid',
      rowKey2: 'device_name',
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
      pagination1: {
        defaultPageSize: 5,
        total: 1,
        defaultCurrent: 1,
      },
      pagination2: {
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
        const response = await axios.get('http://localhost:8026/api/light_data/items');
        this.originalData = response.data;

        const groupedData = {};
        this.originalData.forEach(item => {
          if (!groupedData[item.project]) {
            groupedData[item.project] = item;
          }
        });

        this.data = Object.values(groupedData);
        this.pagination.total = this.data.length;
        this.pagination1.total = this.selectedProjectData.length;
        this.pagination2.total = this.selectedDeviceData.length;

        this.dataLoading = false;
      } catch (error) {
        console.error('获取数据时出错', error);
      }
    },
    handleDelete(row) {
      console.log('正在删除行:', row);
      // 处理删除操作
      const {uuid} = row;
      this.deleteItem(uuid);
    },
    async deleteItem(uuid) {
      try {
        await axios.delete(`http://localhost:8026/api/light_data/items/${uuid}`);
        await this.fetchData();
        console.log('工单删除成功', uuid);
      } catch (error) {
        console.error('Error deleting item', error);
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
    editFunction(row) {
      this.fetchData();
      this.editVisible = true;
    },
    // selectedFunction 方法中
    selectedFunction(row) {
      this.fetchData();

      const project = row.project;

      // 筛选相同项目的设备数据
      this.selectedProjectData = this.originalData.filter(item => item.project === project);

      // 筛选相同 device_name 的数据，并保留每组数据的第一条记录
      const groupedRowData = {};
      this.selectedProjectData.forEach(item => {
        const deviceName = item.device_name;
        if (!groupedRowData[deviceName]) {
          groupedRowData[deviceName] = item;
        }
      });

      // 将筛选后的数据转换为数组
      this.selectedDeviceData = Object.values(groupedRowData);

      // 设置详情对话框标题为项目名
      this.$set(this.$data, 'dialogHeader', project);

      // 打开详情对话框
      this.detailVisible = true;
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
      this.$router.push('/custom/base');
    },
    handleSetupContract() {
      this.$router.push('/work/base');
    },
    handleClickDelete(row) {
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
