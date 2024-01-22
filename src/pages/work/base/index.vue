<template>
  <t-card :bordered="false">
    <t-form
      ref="form"
      :data="formData"
      :label-width="100"
      :rules="FORM_RULES"
      label-align="top"
      @reset="onReset"
      @submit="onSubmit"
    >
      <div class="form-basic-container">
        <div class="form-basic-item">
          <div class="form-basic-container-title">工单信息</div>
          <t-row :gutter="[16, 24]" class="row-gap">
            <t-col :span="6">
              <t-form-item label="客户信息" name="customer">
                <t-input
                  v-model="formData.customer"
                  :style="{ width: '322px' }"
                  placeholder="请输入内容"
                />
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item label="工单类型" name="type">
                <t-select
                  v-model="formData.type"
                  :style="{ width: '322px' }"
                  class="demo-select-base"
                  :clearable="true"
                  placeholder="请选择类型"
                >
                  <t-option v-for="(item, index) in typeOptions" :key="index" :label="item.label" :value="item.value">
                    {{ item.label }}
                  </t-option>
                </t-select>
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item label="优先级" name="priority">
                <t-select
                  v-model="formData.priority"
                  :style="{ width: '322px' }"
                  class="demo-select-base"
                  clearable
                  placeholder="请选择类型"
                >
                  <t-option v-for="(item, index) in partyAOptions" :key="index" :label="item.label" :value="item.value">
                    {{ item.label }}
                  </t-option>
                </t-select>
              </t-form-item>
            </t-col>

            <t-col :span="6">
              <t-form-item label="创建人" name="build_man">
                <t-input v-model="formData.build_man" :style="{ width: '322px' }" placeholder="请输入内容"/>
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item label="负责人" name="head">
                <t-input v-model="formData.head" :style="{ width: '322px' }" placeholder="不填默认创建人"/>
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item label="工单签订日期" name="sign_Date">
                <t-date-picker
                  v-model="formData.build_date"
                  :style="{ width: '322px' }"
                  mode="date"
                  placeholder="不填默认今日"
                  separator="/"
                  theme="primary"
                />
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item label="工单结束日期" name="fin_date">
                <t-date-picker
                  v-model="formData.fin_date"
                  :style="{ width: '322px' }"
                  mode="date"
                  placeholder="不填默认签订后三天"
                  separator="/"
                  theme="primary"
                />
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item label="" name="files">
                <t-upload
                  v-model="formData.files"
                  :before-upload="beforeUpload"
                  :format-response="formatResponse"
                  :size-limit="{ size: 60, unit: 'MB' }"
                  action="https://service-bv448zsw-1257786608.gz.apigw.tencentcs.com/api/upload-demo"
                  tips="请上传pdf文件，大小在60M以内"
                  @fail="handleFail"
                >
                  <t-button class="form-submit-upload-btn" variant="outline"> 上传工单文件</t-button>
                </t-upload>
              </t-form-item>
            </t-col>
          </t-row>

          <div class="form-basic-container-title form-title-gap">其它信息</div>
          <t-form-item label="备注" name="notes">
            <t-textarea v-model="formData.notes" :height="124" placeholder="请输入备注"/>
          </t-form-item>
        </div>
      </div>
      <div class="form-submit-container">
        <div class="form-submit-sub">
          <div class="form-submit-left">
            <t-button class="form-submit-confirm" theme="primary" type="submit"> 提交</t-button>
            <t-button class="form-submit-cancel" theme="default" type="reset" variant="base"> 取消</t-button>
          </div>
        </div>
      </div>
    </t-form>
  </t-card>
</template>
<script>
import {prefix} from '@/config/global';
import axios from "axios";
import {v4 as uuidv4} from 'uuid';

const INITIAL_DATA = {
  customer: '',
  build_man: '',
  build_date: '',
  fin_date: '',
  priority: '',
  type: '',
  head: '',
  notes: '',
  files: [],
};
const FORM_RULES = {
  customer: [{required: true, message: '请输入客户信息', type: 'error'}],
  type: [{required: true, message: '请选择工单类型', type: 'error'}],
  build_man: [{required: true, message: '请输入创建人', type: 'error'}],
  priority: [{required: true, message: '请选择优先级', type: 'error'}],
  signDate: [{required: true, message: '请选择日期', type: 'error'}],
  // fin_date: [{required: true, message: '请选择日期', type: 'error'}],
};

export default {
  name: 'FormBase',
  data() {
    return {
      prefix,
      stepSuccess: true,
      formData: {...INITIAL_DATA},
      FORM_RULES,
      typeOptions: [
        {label: '维修', value: '维修'},
        {label: '服务', value: '服务'},
        {label: '安装', value: '安装'},
      ],
      partyAOptions: [
        {label: '紧急且重要', value: '紧急且重要'},
        {label: '高', value: '高'},
        {label: '中', value: '中'},
        {label: '低', value: '低'},
      ],
      rules: {
        type: [{required: true, message: '请选择工单类型', type: 'error'}],
        signDate: [{required: true, message: '请选择日期', type: 'error'}],
        startDate: [{required: true, message: '请选择日期', type: 'error'}],
        // endDate: [{required: true, message: '请选择日期', type: 'error'}],
      },
    };
  },
  methods: {
    handleFail({file}) {
      this.$message.error(`文件 ${file.name} 上传失败`);
    },
    beforeUpload(file) {
      if (!/\.(pdf)$/.test(file.name)) {
        this.$message.warning('请上传pdf文件');
        return false;
      }
      return true;
    },
    // 用于格式化接口响应值，error 会被用于上传失败的提示文字；url 表示文件/图片地址
    formatResponse(res) {
      return {...res, error: '上传失败，请重试', url: res.url};
    },
    changeStatus() {
      this.stepSuccess = !this.stepSuccess;
    },
    onReset() {
      this.$message.warning('取消新建');
    },
    async onSubmit({ validateResult }) {
      console.log("工单创建函数触发");
      if (validateResult === true) {
        try {
          // 使用 uuid 生成符合指定格式的 id
          const id = uuidv4();
          console.log(id);
          // 从 formData 中提取相关数据
          const { customer, build_man, build_date, fin_date, priority, type, head, notes } = this.formData;

          // 判断 build_date 是否为空，如果为空则设置为今天的日期
          const updatedBuildDate = build_date ? build_date : new Date().toISOString().split('T')[0];
          // 判断 head 是否为空，如果为空则设置为 build_man，否则保持不变
          const updatedHead = head ? head : build_man;
          // 判断 fin_date 是否为空，如果为空则设置为 build_date 往后三天
          const updatedFinDate = fin_date ? fin_date : addDays(updatedBuildDate, 3);
          // 准备要发送到请求体中的数据对象
          const dataToCreate = {
            id: id,
            customer: customer,
            build_man: build_man,
            state: '未承接',
            build_date: updatedBuildDate,
            fin_date: updatedFinDate,
            priority: priority,
            type: type,
            head: updatedHead,
            notes: notes,
          };
          // 往后三天的辅助函数
          function addDays(dateString, days) {
            const date = new Date(dateString);
            date.setDate(date.getDate() + days);
            return date.toISOString().split('T')[0];
          }
          console.log(dataToCreate);
          // 发送创建项目的 HTTP 请求
          const response = await axios.post(`http://localhost:8026/api/work_order/items`, { data: dataToCreate });

          // 处理响应，显示成功消息等
          await this.$message.success(response.data);

        } catch (error) {
          // 处理错误，显示错误消息等
          await this.$message.error('创建项目时发生错误');
        }
      }
    }
  },
};
</script>
<style lang="less" scoped>
@import './index';
</style>
