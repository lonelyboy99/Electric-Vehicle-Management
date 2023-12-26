<template>
  <div>
    <t-card :bordered="false" class="list-card-container">
      <t-form>
        <t-row justify="space-between">
          <t-col>
            <t-form-item label="项目选择" name="status">
              <t-select
                v-model="selectedProject"
                :options="PROJECT_SELECTION"
                class="form-item-content"
                placeholder="请选择操作类型"
                @change="handleSelectChange"
              />
            </t-form-item>
          </t-col>
          <t-col>
            <t-button style="margin-right:1400px" variant="base" @click="handleNav('/list/tree')"> 操作配置</t-button>
          </t-col>
        </t-row>
      </t-form>
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
import {SearchIcon} from 'tdesign-icons-vue';
import Trend from '@/components/trend/index.vue';
import {prefix} from '@/config/global';
import axios from "axios";
import {PROJECT_SELECTION,} from '@/constants';

export default Vue.extend({
  name: 'ListBase',
  components: {
    SearchIcon,
    Trend,
  },
  data() {
    return {
      selectedProject: '',
      PROJECT_SELECTION,
      prefix,
      dataLoading: false,
      receivedMessages: [],
      selectedRowKeys: [],
      value: 'first',
      data: [],
      columns: [
        {
          title: 'UUID',
          align: 'left',
          width: 'auto',
          ellipsis: true,
          colKey: 'uuid',
          fixed: 'left',
        },
        {
          title: '区',
          width: 'auto',
          ellipsis: true,
          colKey: 'area',
        },
        {
          title: '组',
          width: 'auto',
          ellipsis: true,
          colKey: 'cluster',
        },
        {
          title: '号',
          width: 'auto',
          ellipsis: true,
          colKey: 'number',
        },
        {
          title: '网关',
          width: 'auto',
          ellipsis: true,
          colKey: 'device_name',
        },
        {
          title: '区域位置',
          width: 'auto',
          ellipsis: true,
          colKey: 'location',
        },
        {
          title: '账号',
          width: 'auto',
          ellipsis: true,
          colKey: 'account',
        },
        {
          title: '用户名',
          width: 'auto',
          ellipsis: true,
          colKey: 'username',
        },
        {
          title: '所属客户',
          width: 'auto',
          fixed: 'right',
          ellipsis: true,
          colKey: 'customer',
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
    // setInterval(() => {
    //   this.fetchData();
    // }, 1000);
  },

  methods: {
    async fetchData() {
      try {
        let params = {};
        // 如果选中的项目不是 '全部项目'，则设置筛选参数
        if (this.selectedProject !== '全部项目') {
          params = {
            project: this.selectedProject, // 使用选定的项目值
          };
        }

        // 使用筛选参数进行API请求
        const response = await axios.get('http://localhost:3002/api/light_data/items', {params});

        // 使用筛选后的结果更新组件数据
        this.data = response.data;

        // 对数据进行排序（如果需要的话）
        this.data.sort((a, b) => {
          const clusterA = parseInt(a.cluster);
          const clusterB = parseInt(b.cluster);
          return clusterA - clusterB;
        });

        // 更新分页的total属性
        this.pagination.total = this.data.length;

        // 将数据加载状态设为false
        this.dataLoading = false;
      } catch (error) {
        console.error('获取数据时出错', error);
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
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    handleNav(url) {
      this.$router.push(url);
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
