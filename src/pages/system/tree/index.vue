<template>
  <t-card :bordered="false">
    <div class="table-tree-container">
      <div class="list-tree-wrapper">
        <div class="list-tree-operator">
          <t-form>
            <t-form-item>
              <t-select
                v-model="selectedAddress"
                :options="ADDRESS"
                label="地区"
              >
              </t-select>
            </t-form-item>
            <t-form-item>
              <t-select
                v-model="selectedProject"
                :options="PROJECT"
                label="项目"
              >
              </t-select>
            </t-form-item>
          </t-form>
        </div>
        <div class="list-tree-content">
          <common-table
            :selectedProject="selectedProject"
            :selectedAddress="selectedAddress"
          />
        </div>
      </div>
    </div>
  </t-card>
</template>
<script>
import CommonTable from '../components/CommonTable.vue';
import axios from "axios";

export default {
  name: 'ListTree',
  components: {
    CommonTable,
  },
  data() {
    return {
      selectedProject: '全部项目',
      selectedAddress: '全部地区',
      data: [],
      PROJECT: [],
      ADDRESS: [],
      filterText: '',
      filterByText: null,
    };
  },
  mounted() {
    this.fetchData();
    setInterval(() => {
      this.fetchData();
    }, 1000);
  },
  methods: {
    // 灯具信息读取
    async fetchData() {
      try {
        const response = await axios.get('http://localhost:8026/api/light_data/items');
        this.lightData = response.data;
        // 第一步筛选项目名称数组
        const uniqueProjects = this.lightData.filter((item, index, self) => {
          return self.findIndex(el => el.project === item.project) === index;
        });

        // 项目名称数组
        this.PROJECT = [
          { label: '全部项目', value: '全部项目' },
          ...new Set(uniqueProjects.map(item => ({
            label: item.project,
            value: item.project,
          })))
        ];

        // 第二步筛选地区数组
        const uniqueAddresses = this.lightData.filter((item, index, self) => {
          return self.findIndex(el => el.address === item.address) === index;
        });

        // 地区数组
        this.ADDRESS = [
          { label: '全部地区', value: '全部地区' },
          ...new Set(uniqueAddresses.map(item => ({
            label: item.address,
            value: item.address,
          })))
        ];
      } catch (error) {
        console.error('获取数据时出错', error);
      }
    },
    onInput() {
      this.filterByText = (node) => {
        const rs = node.label.indexOf(this.filterText) >= 0;
        return rs;
      };
    },
    rehandleClickOp({text, row}) {
      console.log(text, row);
    },
  },
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.table-tree-container {
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);

  .t-tree {
    margin-top: 24px;
  }
}

.list-tree-wrapper {
  overflow-y: hidden;
}

.list-tree-operator {
  width: 230px;
  float: left;
  padding: 10px 32px;
}

.list-tree-content {
  border-left: 1px solid var(--td-component-border);
  overflow: auto;
}
</style>
