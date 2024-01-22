<template>
  <t-row :gutter="[16, 16]">
    <t-col :xl="6" :xs="12">
      <t-card :bordered="false" class="dashboard-rank-card" title="能耗分布区域">
        <t-table :columns="powerColumns" :data="data" rowKey="productName">
          <template #index="{ rowIndex }">
            <span :class="getRankClass(rowIndex)">
              {{ rowIndex + 1 }}
            </span>
          </template>
          <span slot="growUp" slot-scope="{ row }">
            <trend :describe="Math.abs(row.growUp)" :type="row.growUp > 50 ? 'up' : 'down'"/>
          </span>
          <template #operation="slotProps">
            <a class="link" @click="rehandleClickOp(slotProps)">详情</a>
          </template>
        </t-table>
      </t-card>
    </t-col>
    <t-col :xl="6" :xs="12">
      <t-card :bordered="false" class="dashboard-rank-card" title="项目管理">
        <template #actions>
        </template>
        <t-table
          :columns="projectColumns"
          :data="data"
          :headerAffixedTop="true"
          :hover="true"
          :loading="dataLoading"
          rowKey="uuid"
        >
        </t-table>
      </t-card>
    </t-col>
  </t-row>
</template>
<script>
import Trend from '@/components/trend/index.vue';
import axios from "axios";

export default {
  name: 'RankList',
  components: {
    Trend,
  },
  data() {
    return {
      dataLoading: true,
      timerId: null,
      data: [],
      projectColumns: [
        {
          title: '项目名称',
          width: 'auto',
          ellipsis: true,
          colKey: 'project',
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
      ],
      powerColumns: [
        {
          align: "center",
          colKey: "index",
          title: "排名",
          width: 80,
          fixed: "left",
        },
        {
          align: "left",
          ellipsis: true,
          colKey: "productName",
          title: "区域名称",
          minWidth: 200,
        },
        {
          align: "center",
          colKey: "growUp",
          width: 100,
          title: "较上周",
        },
        {
          align: "center",
          colKey: "count",
          title: "能耗",
          width: 100,
        },
        {
          align: "center",
          colKey: "proportion",
          title: "能耗占比",
          width: 100,
        },
      ]
    };
  },
  mounted() {
    this.fetchData()
    setInterval(() => {
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
        this.dataLoading = false;
      } catch (error) {
        console.error('获取数据时出错', error);
      }
    },
    rehandleClickOp(val) {
      console.log(val);
    },
    getRankClass(index) {
      return ['home-rank__cell', {'dashboard-rank__cell--top': index < 0}];
    },
  },
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.dashboard-rank-card {
  padding: 8px;

  /deep/ .t-card__header {
    padding-bottom: 24px;
  }

  /deep/ .t-card__title {
    font-size: 20px;
    font-weight: 500;
  }
}

.dashboard-rank__cell {
  display: inline-flex;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  font-size: 14px;
  background-color: var(--td-gray-color-5);
  align-items: center;
  justify-content: center;
  font-weight: 700;

  &--top {
    background: var(--td-brand-color);
  }
}
</style>
