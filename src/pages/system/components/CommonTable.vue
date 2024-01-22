<template>
  <div class="list-common-table">
    <t-form
      ref="form"
      :data="formData"
      :label-width="80"
      :style="{ marginBottom: '8px' }"
      colon
      @reset="onReset"
      @submit="onSubmit"
    >
      <t-row>
        <t-col :span="10">
          <t-row :gutter="[16, 24]">
            <t-col>
              <t-form-item label="区" name="name">
                <t-input
                  v-model="searchData.area"
                  :style="{ minWidth: '134px' }"
                  class="form-item-content"
                  placeholder="区"
                  type="search"
                />
              </t-form-item>
            </t-col>
            <t-col>
              <t-form-item label="组" name="status">
                <t-input
                  v-model="searchData.cluster"
                  :style="{ minWidth: '134px' }"
                  class="form-item-content"
                  placeholder="组"
                  type="search"
                />
              </t-form-item>
            </t-col>
            <t-col>
              <t-form-item label="号" name="no">
                <t-input
                  v-model="searchData.number"
                  :style="{ minWidth: '134px' }"
                  class="form-item-content"
                  placeholder="号"
                />
              </t-form-item>
            </t-col>
          </t-row>
        </t-col>
        <t-col :span="2" class="operation-container">
          <t-button :style="{ marginLeft: '8px' }" theme="primary" type="submit" @click="handleSearch()"> 查询
          </t-button>
          <t-button theme="default" type="reset" variant="base" @click="resetSearch()"> 重置</t-button>
        </t-col>
      </t-row>
    </t-form>
    <t-form
      ref="form"
      :data="formData"
      :label-width="80"
      :style="{ marginBottom: '8px' }"
      colon
      @reset="onReset"
      @submit="onSubmit"
    >
      <t-row>
        <t-col>
          <t-row :gutter="[16, 24]">
            <t-col>
              <t-form-item label="灯控操作" name="status">
                <t-select
                  v-model="formData.status"
                  :auto-width="true"
                  :options="LIGHT_CONTROL"
                  class="form-item-content`"
                  placeholder="选择操作类型"
                  :clearable="true"
                />
              </t-form-item>
            </t-col>
            <t-col v-if="showSelect">
              <t-form-item label="网关" name="device_name">
                <t-select
                  v-model="formData.device_name"
                  :options="DEVICE_NAME"
                  class="form-item-content`"
                  placeholder="请选择操作类型"
                  @change="handleGatewayChange()"
                />
              </t-form-item>
            </t-col>
            <t-col v-if="showSelect">
              <t-form-item label="区" name="area">
                <t-select
                  v-model="formData.area"
                  :options="AREA"
                  class="form-item-content`"
                  placeholder="请选择操作类型"
                  @change="handleAreaChange()"
                />
              </t-form-item>
            </t-col>
            <t-col v-if="showSelect1">
              <t-form-item label="号" name="number">
                <t-select
                  v-model="formData.number"
                  :options="NUMBER"
                  class="form-item-content`"
                  placeholder="请选择操作类型"
                />
              </t-form-item>
            </t-col>
            <t-col v-if="showSelect2">
              <t-form-item label="组" name="number">
                <t-select
                  v-model="formData.cluster"
                  :options="CLUSTER"
                  class="form-item-content`"
                  placeholder="请选择操作类型"
                />
              </t-form-item>
            </t-col>
            <t-col v-if="showSelect3">
              <t-form-item label="标签" name="number">
                <t-select
                  v-model="formData.label"
                  :options="LABEL"
                  class="form-item-content`"
                  placeholder="请选择操作类型"
                />
              </t-form-item>
            </t-col>
            <t-col>
              <t-button variant="base" @click="sendMqttMessage('setLightMode','ChangLiang');updateData('常亮','light_mode')">
                常亮
              </t-button>
              <t-button variant="base" @click="sendMqttMessage('setLightMode','ChangMie');updateData('常灭','light_mode')">
                常灭
              </t-button>
              <t-button variant="base" @click="sendMqttMessage('blink','闪一闪')">闪一闪</t-button>
              <t-button variant="base" @click="sendMqttMessage('stopBlink','停止闪')">停止闪</t-button>
              <t-button variant="base" @click="sendMqttMessage('setLightMode','休眠');updateData('休眠','light_mode')">
                休眠
              </t-button>
              <t-button variant="base" @click="moreFunctions"> 更多功能</t-button>
            </t-col>
          </t-row>
        </t-col>
      </t-row>
    </t-form>
    <t-tabs>
      <t-tab-panel>
        <template #label>
          <icon name="wallet" style="margin-right: 4px"/>
          灯具
        </template>
        <t-table
          :columns="columns"
          :data="lightData"
          :headerAffixProps="{ offsetTop, container: getContainer }"
          :headerAffixedTop="true"
          :hover="hover"
          :loading="dataLoading"
          :pagination="pagination"
          :rowKey="rowKey"
          :stripe="true"
          :verticalAlign="verticalAlign"
          @change="rehandleChange"
          @page-change="rehandlePageChange"
        >
          <template #op="slotProps">
            <t-popconfirm :on-confirm="() => handleDelete(slotProps.row)"
                          :popupProps="{ placement: 'right' }"
                          content="确认删除灯具吗"
                          theme="danger"
            >
              <a class="t-button-link" style="color: red">删除</a>
            </t-popconfirm>
          </template>
        </t-table>
      </t-tab-panel>
      <t-tab-panel value="second">
        <template #label>
          <icon name="server" style="margin-right: 4px"/>
          网关
        </template>
        <t-table
          :columns="columns1"
          :data="deviceData"
          :headerAffixProps="{ offsetTop, container: getContainer }"
          :headerAffixedTop="true"
          :hover="hover"
          :loading="dataLoading"
          :pagination="pagination1"
          :rowKey="rowKey1"
          :stripe="true"
          :verticalAlign="verticalAlign"
          @change="rehandleChange"
          @page-change="rehandlePageChange"
        >
          <template #op="slotProps">
            <t-popconfirm :on-confirm="() => handleDelete(slotProps.row)"
                          :popupProps="{ placement: 'right' }"
                          content="确认删除网关吗"
                          theme="danger"
            >
              <a class="t-button-link" style="color: red">删除</a>
            </t-popconfirm>
          </template>
        </t-table>
      </t-tab-panel>
    </t-tabs>
    <t-dialog
      :confirmBtn="null"
      top="4%"
      :visible.sync="functionVisible"
      header="更多功能"
      width="1200px"
    >
      <t-form
        ref="form"
        :data="formData"
        :label-width="80"
        :style="{ marginBottom: '8px' }"
        colon
        @reset="onReset"
        @submit="onSubmit"
      >
        <t-row>
          <t-col>
            <t-row :gutter="[16, 24]">
              <t-col>
                <t-form-item label="灯控操作" name="status">
                  <t-select
                    v-model="formData.status"
                    :options="LIGHT_CONTROL"
                    class="form-item-content`"
                    placeholder="请选择操作类型"
                  />
                </t-form-item>
              </t-col>
              <t-col v-if="showSelect">
                <t-form-item label="网关" name="device_name">
                  <t-select
                    v-model="formData.device_name"
                    :options="DEVICE_NAME"
                    class="form-item-content`"
                    placeholder="请选择操作类型"
                    @change="handleGatewayChange()"
                  />
                </t-form-item>
              </t-col>
              <t-col v-if="showSelect">
                <t-form-item label="区" name="area">
                  <t-select
                    v-model="formData.area"
                    :options="AREA"
                    class="form-item-content`"
                    placeholder="请选择操作类型"
                    @change="handleAreaChange()"
                  />
                </t-form-item>
              </t-col>
              <t-col v-if="showSelect1">
                <t-form-item label="号" name="number">
                  <t-select
                    v-model="formData.number"
                    :options="NUMBER"
                    class="form-item-content`"
                    placeholder="请选择操作类型"
                  />
                </t-form-item>
              </t-col>
              <t-col v-if="showSelect2">
                <t-form-item label="组" name="number">
                  <t-select
                    v-model="formData.cluster"
                    :options="CLUSTER"
                    class="form-item-content`"
                    placeholder="请选择操作类型"
                  />
                </t-form-item>
              </t-col>
              <t-col v-if="showSelect3">
                <t-form-item label="标签" name="number">
                  <t-select
                    v-model="formData.label"
                    :options="LABEL"
                    class="form-item-content`"
                    placeholder="请选择操作类型"
                  />
                </t-form-item>
              </t-col>
            </t-row>
          </t-col>
        </t-row>
      </t-form>
      <div>
        <t-tabs :value="value" @change="(newValue) => (value = newValue)">
          <t-tab-panel value="first">
            <template #label>
              <icon name="home" style="margin-right: 4px"/>
              灯具设置
            </template>
            <t-tabs :value="value1" placement="left" style="margin-top: 20px"
                    @change="(newValue) => (value1 = newValue)">
              <t-tab-panel label="基本设置" value="light_setting">
                <t-list-item>
                  亮灯模式
                  <template #action>
                    <t-space size="70px">
                      <t-radio-group v-model="selectedMode" variant="primary-filled">
                        <t-radio-button style="margin-left: auto" value="1">常亮</t-radio-button>
                        <t-radio-button style="margin-left: auto" value="2">常灭</t-radio-button>
                        <t-radio-button style="margin-left: auto" value="3">感应</t-radio-button>
                      </t-radio-group>
                      <t-button
                        @click="sendMqttMessage('setLightMode', getModeLabel(selectedMode));updateData(getModeLabel(selectedMode),'light_mode')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  有人亮度
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="light_value" style="margin-right: 184px"/>
                      <t-button
                        @click="sendMqttMessage('setHighBright', light_value+'%');updateData(light_value+'%','high_bright')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  无人亮度
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="light_value1" style="margin-right: 184px"/>
                      <t-button
                        @click="sendMqttMessage('setStandbyBright', light_value1+'%');updateData(light_value1+'%','standby_bright')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  色温
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="light_value2" style="margin-right: 184px"/>
                      <t-button
                        @click="sendMqttMessage('setCctBright', light_value2+'%');updateData(light_value2+'%','current_cct')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  感应模式
                  <template #action>
                    <t-space size="70px">
                      <t-radio-group v-model="selectedMode1" default-value="1" variant="primary-filled">
                        <t-radio-button style="margin-left: auto" value="4">一段</t-radio-button>
                        <t-radio-button style="margin-left: auto" value="5">二段</t-radio-button>
                      </t-radio-group>
                      <t-button
                        @click="sendMqttMessage('setDelayMode', getModeLabel(selectedMode1));updateData(getModeLabel(selectedMode1),'delay_mode')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  一段延时
                  <template #action>
                    <t-space size="70px">
                      <t-form>
                        <t-form-item name="number">
                          <t-select
                            v-model="delay_time1"
                            :options="DELAY_TIME"
                            class="form-item-content`"
                            placeholder="请选择延时时间"
                          />
                        </t-form-item>
                      </t-form>
                      <t-button
                        @click="sendMqttMessage('setDelayTime', delay_time1+'s');updateData(delay_time1+'s','delay_time')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  二段延时
                  <template #action>
                    <t-space size="70px">
                      <t-form>
                        <t-form-item name="number">
                          <t-select
                            v-model="delay_time2"
                            :options="DELAY_TIME"
                            class="form-item-content`"
                            placeholder="请选择延时时间"
                          />
                        </t-form-item>
                      </t-form>
                      <t-button
                        @click="sendMqttMessage('setDelayTime2', delay_time2+'s');updateData(delay_time2+'s','delay_time2')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  恒照度模式
                  <template #action>
                    <t-space size="70px">
                      <t-radio-group v-model="selectedMode2" default-value="1" variant="primary-filled">
                        <t-radio-button style="margin-left: auto" value="6">无效</t-radio-button>
                        <t-radio-button style="margin-left: auto" value="7">自控</t-radio-button>
                        <t-radio-button style="margin-left: auto" value="8">被控</t-radio-button>
                      </t-radio-group>
                      <t-button
                        @click="sendMqttMessage('setAlsMode', getModeLabel(selectedMode2));updateData(getModeLabel(selectedMode2),'alscontrol_mode')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
              </t-tab-panel>
              <t-tab-panel label="传感器设置" value="second">
                <t-list-item>
                  传感器开关
                  <template #action>
                    <t-space size="70px">
                      <t-switch v-model="checked" :label="['开', '关']" size="large"></t-switch>
                      <t-button
                        @click="sendMqttMessage(checked ? 'ssrOn' : 'ssrOff');updateData(checked ? '开' : '关','sensor_status')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  组网开关
                  <template #action>
                    <t-space size="70px">
                      <t-switch v-model="checked1" :label="['开', '关']" size="large"></t-switch>
                      <t-button
                        @click="sendMqttMessage(checked1 ? 'netOn' : 'netOff');updateData(checked1 ? '开' : '关','sensor_status')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  触发间隔
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="light_trigger" :max="60" style="margin-right: 184px"/>
                      <t-button @click="sendMqttMessage('setSensorlnterval', light_trigger)">发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
              </t-tab-panel>
              <t-tab-panel label="调光设置" value="third">
                <t-list-item>
                  亮灯速度
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="light_fast" :max="9" style="margin-right: 184px"/>
                      <t-button
                        @click="sendMqttMessage('setBrightRiseTime', light_fast+'s');updateData(light_fast+'s','bright_risetime')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  灭灯速度
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="light_fast1" :max="9" style="margin-right: 184px"/>
                      <t-button
                        @click="sendMqttMessage('setBrightFallTime', light_fast1+'s');updateData(light_fast1+'s','bright_falltime')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  色温调高速度
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="light_fast2" :max="9" style="margin-right: 184px"/>
                      <t-button @click="sendMqttMessage('setCctRiseTime', light_fast2)">发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  色温降低速度
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="light_fast3" :max="9" style="margin-right: 184px"/>
                      <t-button @click="sendMqttMessage('setCctFallTime', light_fast3)">发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
              </t-tab-panel>
              <t-tab-panel label="遥控器设置" value="fourth">
                <t-list-item>
                  红外开关
                  <template #action>
                    <t-space size="70px">
                      <t-switch v-model="checked2" :label="['开', '关']" size="large"></t-switch>
                      <t-button
                        @click="sendMqttMessage(checked2 ? 'ircOn' : 'ircOff');updateData(checked2 ? '开' : '关','irc_status')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
              </t-tab-panel>
              <t-tab-panel label="恒照度" value="fifth">
                <t-list-item>
                  设置照度值
                  <template #action>
                    <t-space size="70px">
                      <t-input
                        v-model="light_ill"
                        placeholder="目标照度值[0-9000]"/>
                      <t-button @click="sendMqttMessage('setAlsLux', light_ill)">发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  发射开关
                  <template #action>
                    <t-space size="70px">
                      <t-switch v-model="checked3" :label="['开', '关']" size="large"></t-switch>
                      <t-button @click="sendMqttMessage(checked3 ? 'alsSyncEnable' : 'alsSyncDisable')">发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  发射间隔
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="light_trigger1" :max="200" style="margin-right: 184px"/>
                      <t-button @click="sendMqttMessage('setAlsInterval', light_trigger1)">发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  给恒照度传感器起名
                  <template #action>
                    <t-space size="70px">
                      <t-input
                        v-model="light_name"
                        placeholder="当前照度昵称"/>
                      <t-button @click="sendMqttMessage('setAlsNotice', light_name)">发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
              </t-tab-panel>
              <t-tab-panel label="网络设置" value="sixth">
                <t-list-item>
                  组跳数
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="mesh" :max="20" style="margin-right: 184px"/>
                      <t-button @click="sendMqttMessage('setGroupTtl', mesh)">发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  网跳数
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="mesh1" :max="20" style="margin-right: 184px"/>
                      <t-button @click="sendMqttMessage('setNetTtl', mesh1)">发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  重发次数
                  <template #action>
                    <t-space size="70px">
                      <t-slider v-model="mesh2" :max="10" style="margin-right: 184px"/>
                      <t-button @click="sendMqttMessage('setTxTimes', mesh2)">发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  转发开关
                  <template #action>
                    <t-space size="70px">
                      <t-switch v-model="checked4" :label="['开', '关']" size="large"></t-switch>
                      <t-button
                        @click="sendMqttMessage(checked4 ? 'relayOn' : 'relayOff');updateData(checked4 ? '开' : '关','sensor_transmit')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
              </t-tab-panel>
            </t-tabs>
          </t-tab-panel>
          <t-tab-panel value="number">
            <template #label>
              <icon name="edit-1" style="margin-right: 4px"/>
              设备编号
            </template>
            <t-tabs :value="value2" placement="left" style="margin-top: 20px"
                    @change="(newValue) => (value2 = newValue)">
              <t-tab-panel label="编号设置" value="device_number">
                <t-list-item>
                  修改区
                  <template #action>
                    <t-space size="70px">
                      <t-input v-model="newArea"/>
                      <t-button
                        @click="sendMqttMessage('setAreaAddress', newArea);updateData(newArea,'area')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  修改组
                  <template #action>
                    <t-space size="70px">
                      <t-input v-model="newCluster"/>
                      <t-button
                        @click="sendMqttMessage('setClusterAddress', newCluster);updateData(newCluster,'cluster')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  修改号
                  <template #action>
                    <t-space size="70px">
                      <t-input v-model="newNumber"/>
                      <t-button
                        @click="sendMqttMessage('setNumberAddress', newNumber);updateData(newNumber,'number')">
                        发送
                      </t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  设置标签
                  <template #action>
                    <t-space size="70px">
                      <t-input/>
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  删除标签
                  <template #action>
                    <t-space size="70px">
                      <t-input/>
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  清空标签
                  <template #action>
                    <t-space size="70px">
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  设置邻组通知
                  <template #action>
                    <t-space size="70px">
                      <t-input/>
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  删除邻组通知
                  <template #action>
                    <t-space size="70px">
                      <t-input/>
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  清空邻组通知
                  <template #action>
                    <t-space size="70px">
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>

              </t-tab-panel>
              <t-tab-panel label="设备关联" value="second">
                <t-list-item>
                  设备命名
                  <template #action>
                    <t-space size="70px">
                      <t-input/>
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  关联设备
                  <template #action>
                    <t-space size="70px">
                      <t-input/>
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  解除关联
                  <template #action>
                    <t-space size="70px">
                      <t-input/>
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
              </t-tab-panel>
            </t-tabs>
          </t-tab-panel>
          <t-tab-panel value="mode">
            <template #label>
              <icon name="layers" style="margin-right: 4px"/>
              情景模式
            </template>
            <t-tabs :value="value3" placement="left" style="margin-top: 20px"
                    @change="(newValue) => (value3 = newValue)">
              <t-tab-panel label="常规情景" value="scenario_mode">
                <t-list-item>
                  读取情景模式
                  <template #action>
                    <t-space size="70px">
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  切换情景模式
                  <template #action>
                    <t-space size="70px">
                      <t-select/>
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <t-list-item>
                  情景模式重命名
                  <template #action>
                    <t-space size="70px">
                      <t-select/>
                      <p>新名称</p>
                      <t-select/>
                      <t-button>发送</t-button>
                    </t-space>
                  </template>
                </t-list-item>
                <p style="color: #be5a00">重命名可作用于单灯、群组、区操作等</p>
              </t-tab-panel>
              <t-tab-panel label="定时情景" value="second">
                <p style="padding: 25px">....</p>
              </t-tab-panel>
            </t-tabs>
          </t-tab-panel>
        </t-tabs>
      </div>
    </t-dialog>
  </div>
</template>
<script>
import {prefix} from '@/config/global';
import {Icon, IconFont} from 'tdesign-icons-vue';

import {
  LIGHT_CONTROL,
  DELAY_TIME,
} from '@/constants';
import mqtt from "mqtt";
import axios from "axios";

export default {
  name: 'list-table',
  components: {
    Icon,
    IconFont,
  },
  props: {
    selectedProject: String,
    selectedAddress: String,
  },
  data() {
    return {
      // 更多功能
      timerId: null,
      selectedMode: "1",
      selectedMode1: "4",
      selectedMode2: "6",
      checked: false,
      checked1: false,
      checked2: false,
      checked3: false,
      checked4: false,
      delay_time1: "0",
      delay_time2: "0",
      showSelect: false,
      showSelect1: false,
      showSelect2: false,
      showSelect3: false,
      light_value: 0,
      light_value1: 0,
      light_value2: 0,
      light_trigger: 0,
      light_trigger1: 0,
      light_fast: 0,
      light_fast1: 0,
      light_fast2: 0,
      light_fast3: 0,
      newArea: "",
      newCluster: "",
      newNumber: "",
      light_ill: "",
      light_name: "",
      mesh: 0,
      mesh1: 0,
      mesh2: 0,
      DEVICE_NAME: [],
      AREA: [],
      NUMBER: [],
      CLUSTER: [],
      LABEL: [],
      LIGHT_CONTROL,
      DELAY_TIME,
      prefix,
      searchData: {
        area: '',
        cluster: '',
        number: '',
      },
      formData: {
        device_name: '',
        area: '',
        cluster: '',
        number: '',
        label: '',
      },
      selectedRowKeys: [],
      deviceData: [],
      receivedMessages: [],
      tableData: [],
      lightData: [],
      isPolling: true,//轮询操作标志位
      dataLoading: false,
      value: 'first',
      value1: 'light_setting',
      value2: 'device_number',
      value3: 'scenario_mode',

      columns: [
        {colKey: 'row-select', type: 'multiple', width: 20, fixed: 'left'},
        {
          title: 'UUID',
          align: 'left',
          width: 200,
          ellipsis: true,
          colKey: 'uuid',
          fixed: 'left',
          attrs: {
            style: {
              fontWeight: 600,
            },
          },
        },
        {
          title: '区',
          align: 'center',
          width: 80,
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
          align: 'center',
          width: 80,
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
          align: 'center',
          width: 80,
          ellipsis: true,
          colKey: 'number',
          attrs: {
            style: {
              fontWeight: 600,
            },
          },
        },
        {
          title: '情景模式',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'scene_no',
        },
        {
          title: '亮灯模式',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'light_mode',
        },
        {
          title: '能耗(千瓦时)',
          align: 'center',
          width: 130,
          ellipsis: true,
          colKey: 'energy_dur',
        },
        {
          title: '功率(瓦)',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'power',
        },
        {
          title: '能耗更新时间',
          align: 'center',
          width: 120,
          ellipsis: true,
          colKey: 'ConsumptionUpdate',
        },
        {
          title: '当前亮度',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'current_bright',
        },
        {
          title: '有人亮度',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'high_bright',
        },
        {
          title: '无人亮度',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'standby_bright',
        },
        {
          title: '色温',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'current_cct',
        },
        {
          title: '恒照度模式',
          align: 'center',
          width: 120,
          ellipsis: true,
          colKey: 'alscontrol_mode',
        },
        {
          title: '亮灯速度',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'bright_risetime',
        },
        {
          title: '灭灯速度',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'bright_falltime',
        },
        {
          title: '传感器开关',
          align: 'center',
          width: 120,
          ellipsis: true,
          colKey: 'sensor_status',
        },
        {
          title: '组网开关',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'sensor_sync',
        },
        {
          title: '转发开关',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'sensor_transmit',
        },
        {
          title: '红外开关',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'irc_status',
        },
        {
          title: '感应模式',
          align: 'center',
          width: 100,
          ellipsis: true,
          colKey: 'delay_mode',
        },
        {
          title: '一段延时',
          align: 'center',
          width: 120,
          ellipsis: true,
          colKey: 'delay_time',
        },
        {
          title: '二段延时',
          align: 'center',
          width: 120,
          ellipsis: true,
          colKey: 'delay_time2',
        },
        {
          title: '设备更新时间',
          align: 'center',
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
      columns1: [
        {colKey: 'row-select', type: 'multiple', width: 20, fixed: 'left'},
        {
          title: '网关',
          align: 'left',
          width: 200,
          ellipsis: true,
          colKey: 'device_name',
          fixed: 'left',
        },
        {
          align: 'center',
          fixed: 'right',
          width: 200,
          colKey: 'op',
          title: '操作',
        },
      ],
      rowKey: 'uuid',
      rowKey1: 'device_name',
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
      pagination1: {
        defaultPageSize: 10,
        total: 1,
        defaultCurrent: 1,
      },
      functionVisible: false,
      confirmVisible: false,
      deleteIdx: -1,
    };
  },
  computed: {
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  watch: {
    'formData.status': function (newStatus) {
      // 重置 formData 中的其他字段
      this.resetOtherFields();

      // 检查第一个下拉菜单的选定值并更新其他字段
      if (newStatus === '1') {
        this.formData.code = "400";
      } else if (newStatus === '2' || newStatus === '3' || newStatus === '4' || newStatus === '5') {
        // 如果选择了"区操作"，显示第二个下拉菜单并更新其选项
        this.showSelect = true;
        this.showSelect1 = newStatus === '3';
        this.showSelect2 = newStatus === '4';
        this.showSelect3 = newStatus === '5';
        if (newStatus === '3') {
          this.formData.code = "100";
        } else {
          this.formData.code = "200";
        }
      } else {
        this.showSelect = false;
        this.showSelect1 = newStatus === '3';
        this.showSelect2 = newStatus === '4';
        this.showSelect3 = newStatus === '5';
      }
    },
  },
  mounted() {
    this.dataLoading = true;
    this.initMqtt();
    this.fetchData();
    this.timerId = setInterval(() => {
      if(this.isPolling){
      this.fetchData();
      }
    }, 1000);
  },
  methods: {
    /**
     * 数据清除函数
     */
    // 数据清除
    resetOtherFields() {
      this.formData.device_name = '';
      this.formData.area = '';
      this.formData.number = '';
      this.formData.cluster = '';

      // 重置下拉菜单的显示状态
      this.showSelect = false;
      this.showSelect1 = false;
      this.showSelect2 = false;
      this.showSelect3 = false;
    },

    /**
     *
     * 信息读取函数 后端地址 http://localhost:8026/api/light_data/items
     */
    // 灯具信息读取
    async fetchData() {
      try {
        let queryString = '';

        if (this.selectedProject && this.selectedProject !== '全部项目') {
          queryString += `?project=${encodeURIComponent(this.selectedProject)}`;
        }

        if (this.selectedAddress && this.selectedAddress !== '全部地区') {
          queryString += queryString ? `&address=${encodeURIComponent(this.selectedAddress)}` : `?address=${encodeURIComponent(this.selectedAddress)}`;
        }

        const response = await axios.get(`http://localhost:8026/api/light_data/items${queryString}`);

        this.lightData = response.data;
        this.deviceData = response.data;
        // 对数据进行排序（如果需要的话）
        this.lightData.sort((a, b) => {
          const clusterA = parseInt(a.cluster);
          const clusterB = parseInt(b.cluster);
          return clusterA - clusterB;
        });
        this.lightData.forEach(item => {
          item.ConsumptionUpdate = this.formatTimestamp(item.ConsumptionUpdate);
        });

        this.deviceData = this.deviceData.filter((item, index, self) => {
          const isDuplicate = self.findIndex(el => el.device_name === item.device_name) !== index;
          return !isDuplicate;
        });

        this.DEVICE_NAME = [...new Set(this.deviceData.map(item => ({
          label: item.device_name,
          value: item.device_name,
        })))];

        this.pagination.total = this.lightData.length;
        this.pagination1.total = this.deviceData.length;

        this.dataLoading = false;
      } catch (error) {
        console.error('获取数据时出错', error);
      }
    },
    /**
     *
     * 根据网关下拉选项更新区下拉选项值
     */
    async handleGatewayChange() {
      // 获取过滤后的区的选项
      this.AREA = [...new Set(this.lightData.filter(item => item.device_name === this.formData.device_name).map(item => ({
        label: item.area,
        value: item.area,
      })))];

      // 清空其他下拉菜单的选中值
      this.formData.area = '';
      this.formData.cluster = '';
      this.formData.number = '';
    },

    /**
     *
     * 根据区下拉选项更新组，号下拉选项值
     */
    async handleAreaChange() {

      // 获取过滤后的组的选项
      this.CLUSTER = [...new Set(this.lightData.filter(item => item.device_name === this.formData.device_name && item.area === this.formData.area).map(item => ({
        label: item.cluster,
        value: item.cluster,
      })))];

      // 获取过滤后的号的选项
      this.NUMBER = [...new Set(this.lightData.filter(item => item.device_name === this.formData.device_name && item.area === this.formData.area).map(item => ({
        label: item.number,
        value: item.number,
      })))];

      this.formData.cluster = '';
      this.formData.number = '';
    },
    /**
     *
     * 查询函数
     */
    async handleSearch() {
      try {
        // 构建查询参数
        const searchParams = {
          area: this.searchData.area,
          cluster: this.searchData.cluster,
          number: this.searchData.number,
        };

        // 使用查询参数调用后端接口
        const response = await axios.post('http://localhost:8026/api/light_data/search', searchParams);

        // 将后端返回的数据存储到已有的数据集中
        this.lightData = response.data;


        this.lightData.forEach(item => {
          item.ConsumptionUpdate = this.formatTimestamp(item.ConsumptionUpdate);
        });

        // 在已有数据上进行二次筛选
        this.lightData = this.lightData.filter(item => {
          return (
            (!searchParams.area || item.area === searchParams.area) &&
            (!searchParams.cluster || item.cluster === searchParams.cluster) &&
            (!searchParams.number || item.number === searchParams.number)
          );
        });

        // 更新分页总数等信息
        this.pagination.total = this.lightData.length;

        // 停止轮询
        this.isPolling = false;

      } catch (error) {
        console.error('查询数据时出错', error);
      }
    },

    /**
     *
     * 重置函数
     */
    resetSearch() {
      // 重置查询条件
      this.searchData.area = '';
      this.searchData.cluster = '';
      this.searchData.number = '';

      // 重新开始轮询
      this.isPolling = true;
    },

    /**
     *
     * 信息更新函数
     */
    // 灯具信息更新
    async updateData(value, listName) {
      try {
        const updatePayload = {
          device_name: this.formData.device_name,
          area: this.formData.area,
          cluster: this.formData.cluster,
          number: this.formData.number,
          [listName]: value,
        };
        console.log(updatePayload);
        let url = `http://localhost:8026/api/light_data/items`;

        if (this.formData.device_name !== undefined && this.formData.device_name !== null && this.formData.device_name !== '') {
          url += `/${encodeURIComponent(this.formData.device_name)}`;
        } else {
          url += '/NA';
        }

        if (this.formData.area !== undefined && this.formData.area !== null && this.formData.area !== '') {
          url += `/${encodeURIComponent(this.formData.area)}`;
        } else {
          url += '/NA';
        }

        if (this.formData.cluster !== undefined && this.formData.cluster !== null && this.formData.cluster !== '') {
          url += `/${encodeURIComponent(this.formData.cluster)}`;
        } else {
          url += '/NA';
        }

        if (this.formData.number !== undefined && this.formData.number !== null && this.formData.number !== '') {
          url += `/${encodeURIComponent(this.formData.number)}`;
        } else {
          url += '/NA';
        }

        console.log(url);
        await axios.put(url, {data: updatePayload, listName}); // 发送 updateField 到后端

        await this.fetchData();
      } catch (error) {
        console.error('更新数据时出错', error);
      }
    },

    /**
     *
     * 时间数据处理函数
     * 将时间数据处理成 年-月-日格式
     */
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    /**
     *
     * @param uuid
     * @returns {Promise<void>}
     */
    async deleteItem(uuid) {
      try {
        await axios.delete(`http://localhost:8026/api/light_data/items/${uuid}`);
        await this.fetchData();
        console.log('灯具删除成功', uuid);
      } catch (error) {
        console.error('Error deleting item', error);
      }
    },
    handleDelete(row) {
      console.log('正在删除行:', row);
      // 处理删除操作
      const {uuid} = row;
      this.deleteItem(uuid);
    },

    /**
     *
     * @param mode
     * @returns {string}
     */
    getModeLabel(mode) {
      switch (mode) {
        case "1":
          return "常亮";
        case "2":
          return "常灭";
        case "3":
          return "感应";
        case "4":
          return "一段";
        case "5":
          return "二段";
        case "6":
          return "无效";
        case "7":
          return "自控";
        case "8":
          return "被控";
        default:
          return ""; // Handle default case if needed
      }
    },
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
    rehandleClickOp({text, row}) {
      console.log(text, row);
    },
    handleClickDelete(row) {
      this.deleteIdx = row.rowIndex;
      this.confirmVisible = true;
    },
    moreFunctions() {
      this.functionVisible = true;
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
        console.log(`接收到消息，主题：${topic}, 消息：${message.toString()}`);
      }.bind(this));

      this.client1.on('message', function (topic, message, packet) {
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
      this.client1.publish(topic, message, {qos: 0}, (err) => {
        if (!err) {
          console.log(`主题为：${topic},内容为：${message} 发布成功`)
        }
      })
    },
    /**
     * MQTT发送控灯指令
     */
    sendMqttMessage(action, mode) {
      const message = {
        code: this.formData.code,
        deviceName: this.formData.device_name,
        area: this.formData.area,
        address: this.formData.number,
        action: action,
        params: mode,
        identity: ""
      };

      const jsonString = JSON.stringify(message);
      this.publish("led/led", jsonString);
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

.t-table td.custom-cell-class-name {
  color: orange;
  font-size: 18px;
  font-weight: bold;
}
</style>
