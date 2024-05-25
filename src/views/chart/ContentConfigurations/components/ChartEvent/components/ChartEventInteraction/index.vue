<template>
  <n-collapse-item title="组件交互" name="1" v-if="interactActions.length">
    <template #header-extra>
      <n-button type="primary" tertiary size="small" @click.stop="evAddEventsFn">
        <template #icon>
          <n-icon>
            <add-icon />
          </n-icon>
        </template>
        新增
      </n-button>
    </template>

    <!-- 无数据 -->
    <div v-if="!targetData.events.interactEvents.length" class="no-data go-flex-center">
      <img :src="noData" alt="暂无数据" />
      <n-text :depth="3">暂无内容</n-text>
    </div>

    <n-card
      v-for="(item, cardIndex) in targetData.events.interactEvents"
      :key="cardIndex"
      class="n-card-shallow"
      size="small"
    >
      <n-space justify="space-between">
        <n-text>关联组件 - {{ cardIndex + 1 }}</n-text>
        <n-button type="error" text size="small" @click="evDeleteEventsFn(cardIndex)">
          <template #icon>
            <n-icon>
              <close-icon />
            </n-icon>
          </template>
        </n-button>
      </n-space>

      <n-divider style="margin: 10px 0" />

      <n-tag :bordered="false" type="primary"> 选择目标组件 </n-tag>

      <setting-item-box name="触发事件" :alone="true">
        <n-input-group v-if="interactActions">
          <n-select
            class="select-type-options"
            v-model:value="item.interactOn"
            size="tiny"
            :options="interactActions"
          />
        </n-input-group>
      </setting-item-box>

      <setting-item-box :alone="true">
        <template #name>
          <n-text>绑定</n-text>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-icon size="21" :depth="3">
                <help-outline-icon></help-outline-icon>
              </n-icon>
            </template>
            <n-text>不支持「静态组件」支持「组件」「公共APi」</n-text>
          </n-tooltip>
        </template>
        <n-select
          class="select-type-options"
          value-field="id"
          label-field="title"
          size="tiny"
          filterable
          placeholder="仅展示符合条件的组件"
          v-model:value="item.interactComponentId"
          :options="fnEventsOptions()"
        />
      </setting-item-box>

      <setting-item-box v-if="fnDimensionsAndSource(item.interactOn).length" name="查询结果" :alone="true">
        <n-table size="small" striped>
          <thead>
            <tr>
              <th v-for="item in ['参数', '说明']" :key="item">{{ item }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cItem, index) in fnDimensionsAndSource(item.interactOn)" :key="index">
              <td>{{ cItem.value }}</td>
              <td>{{ cItem.label }}</td>
            </tr>
          </tbody>
        </n-table>
      </setting-item-box>

      <n-tag :bordered="false" type="primary"> 关联目标请求参数 </n-tag>

      <setting-item-box
        :name="requestParamsItem"
        v-for="requestParamsItem in requestParamsTypeList"
        :key="requestParamsItem"
      >
        <setting-item
          v-for="(ovlValue, ovlKey, index) in fnGetRequest(item.interactComponentId, requestParamsItem)"
          :key="index"
          :name="`${ovlKey}`"
        >
          <n-select
            size="tiny"
            v-model:value="item.interactFn[ovlKey]"
            :options="fnDimensionsAndSource(item.interactOn)"
            clearable
          ></n-select>
        </setting-item>
        <n-text
          v-show="JSON.stringify(fnGetRequest(item.interactComponentId, requestParamsItem)) === '{}'"
          class="go-pt-1"
          depth="3"
        >
          暂无数据
        </n-text>
      </setting-item-box>
      <template v-if="fnExposedPropOptions(item.interactComponentId).length">
        <n-tag :bordered="false" type="primary"> 更新目标组件属性 </n-tag>
        <setting-item-box name="属性">
          <n-select
            size="tiny"
            v-model:value="item.interactProp.prop"
            :options="fnExposedPropOptions(item.interactComponentId)"
            clearable
          ></n-select>
        </setting-item-box>
        
        <setting-item-box :alone="true" :hideName="true" :itemRightStyle="{ width: '100%' }" v-if="item.interactProp.handler">
          <modal-monaco-editor-and-show
            v-model:modelValue="item.interactProp.handler"
            handler-name="handler(eventData, targetPropSetter)"
            :placeholder="item.interactProp.handler || `targetPropSetter(eventData)`"
            :cardStyle="{ width: '294px' }"
          ></modal-monaco-editor-and-show>
        </setting-item-box>
      </template>

      <template v-if="fnExposedMethodOptions(item.interactComponentId).length">
        <n-tag :bordered="false" type="primary"> 调用目标组件方法 </n-tag>
        <setting-item-box name="方法">
          <n-select
            size="tiny"
            v-model:value="item.interactMethod.method"
            :options="fnExposedMethodOptions(item.interactComponentId)"
            clearable
          ></n-select>
        </setting-item-box>

        <setting-item-box :alone="true" :hideName="true" :itemRightStyle="{ width: '100%' }" v-if="item.interactMethod.handler">
          <modal-monaco-editor-and-show
            v-model:modelValue="item.interactMethod.handler"
            handler-name="handler(eventData, targetMethod)"
            :placeholder="item.interactMethod.handler || `targetMethod(eventData)`"
            :cardStyle="{ width: '294px' }"
          ></modal-monaco-editor-and-show>
        </setting-item-box>
      </template>
    </n-card>
  </n-collapse-item>
</template>

<script lang="ts" setup>
import { VNodeChild, computed } from 'vue'
import { SelectOption, SelectGroupOption } from 'naive-ui'
import { SettingItemBox, SettingItem, CollapseItem } from '@/components/Pages/ChartItemSetting'
import { CreateComponentType, CreateComponentGroupType, ChartFrameEnum } from '@/packages/index.d'
import { RequestParamsTypeEnum, RequestDataTypeEnum } from '@/enums/httpEnum'
import { InteractEventOn, COMPONENT_INTERACT_EVENT_KET } from '@/enums/eventEnum'
import { useChartInstanceStore } from '@/store/modules/chartInstanceStore/chartInstanceStore'
import { icon } from '@/plugins'
import noData from '@/assets/images/canvas/noData.png'
import { goDialog } from '@/utils'
import { useTargetData } from '../../../hooks/useTargetData.hook'
import type { ExposedPropType, ExposedMethodType } from '@/packages/index.d'

const { CloseIcon, AddIcon, HelpOutlineIcon } = icon.ionicons5
const { targetData, chartEditStore } = useTargetData()
const requestParamsTypeList = [RequestParamsTypeEnum.PARAMS, RequestParamsTypeEnum.HEADER]

const chartInstanceStore = useChartInstanceStore()
// 获取组件交互事件列表
const interactActions = computed(() => {
  const interactActions = targetData.value.interactActions
  if (!interactActions) return []
  return interactActions.map(value => ({
    label: value.interactName,
    value: value.interactType
  }))
})

// 获取组件事件
const option = computed(() => {
  return targetData.value.option
})
const fnExposedPropOptions = (id: string | undefined): Array<ExposedPropType> => {
  if (!id) {
    return []
  }
  const instance = chartInstanceStore.getComponentInstance(id)
  return (instance?.exposed?.getExposedProps() || []).map((item: ExposedPropType) => 
    ({...item, label: `${item.label} - ${item.value}`})
  )
}
const fnExposedMethodOptions = (id: string | undefined): Array<ExposedMethodType> => {
  if (!id) {
    return []
  }
  const instance = chartInstanceStore.getComponentInstance(id)
  return (instance?.exposed?.getExposedMethods() || []).map((item: ExposedMethodType) => 
    ({...item, label: `${item.label} - ${item.value}()`})
  )
}
// 绑定组件数据 request
const fnGetRequest = (id: string | undefined, key: RequestParamsTypeEnum) => {
  if (!id) return {}
  const globalConfigPindApr = chartEditStore.requestGlobalConfig.requestDataPond.find(item => {
    return item.dataPondId === id
  })?.dataPondRequestConfig.requestParams

  if (globalConfigPindApr) return globalConfigPindApr[key]
  return chartEditStore.componentList[chartEditStore.fetchTargetIndex(id)]?.request.requestParams[key]
}

// 查询结果
const fnDimensionsAndSource = (interactOn: InteractEventOn | undefined) => {
  if (!interactOn || !targetData.value.interactActions) return []
  const tableData = targetData.value.interactActions.find(item => {
    return item.interactType === interactOn
  })

  return tableData?.componentEmitEvents[option.value[COMPONENT_INTERACT_EVENT_KET]] || []
}

// 绑定组件列表
const fnEventsOptions = (): Array<SelectOption | SelectGroupOption> => {
  // 扁平化树形数据
  // const fnFlattern = (
  //   data: Array<CreateComponentType | CreateComponentGroupType>
  // ): Array<CreateComponentType | CreateComponentGroupType> => {
  //   return data.reduce(
  //     (
  //       iter: Array<CreateComponentType | CreateComponentGroupType>,
  //       val: CreateComponentType | CreateComponentGroupType
  //     ) => {
  //       if (!val.groupList && val.request.requestDataType === RequestDataTypeEnum.AJAX && val.request.requestUrl) {
  //         iter.push(val)
  //       }
  //       return val.groupList && val.groupList.length > 0 ? [...iter, ...fnFlattern(val.groupList)] : iter
  //     },
  //     []
  //   )
  // }

  const filterOptionList = chartEditStore.componentList.filter(item => {
    // 排除自己
    const isNotSelf = item.id !== targetData.value.id
    // 排除静态组件
    const isNotStatic = item.chartConfig.chartFrame !== ChartFrameEnum.STATIC
    // 排除分组
    const isNotGroup = !item.isGroup

    return isNotSelf && isNotStatic && isNotGroup
  })
  const mapOptionList = filterOptionList.map(item => ({
    id: item.id,
    title: item.chartConfig.title,
    disabled: false,
    type: 'componentList'
  }))

  // const requestDataPond = chartEditStore.requestGlobalConfig.requestDataPond.map(item => ({
  //   id: item.dataPondId,
  //   title: item.dataPondName,
  //   disabled: false,
  //   type: 'requestDataPond'
  // }))
  // const tarArr = requestDataPond.concat(mapOptionList)
  targetData.value.events.interactEvents?.forEach(iaItem => {
    mapOptionList.forEach(optionItem => {
      if (optionItem.id === iaItem.interactComponentId) {
        optionItem.disabled = true
      }
    })
  })

  return mapOptionList
}

// 新增模块
const evAddEventsFn = () => {
  targetData.value.events.interactEvents.push({
    interactOn: undefined,
    interactComponentId: undefined,
    interactFn: {},
    interactProp: {},
    interactMethod: {}
  })
}

// 删除模块
const evDeleteEventsFn = (index: number) => {
  goDialog({
    message: '是否删除此关联交互模块?',
    onPositiveCallback: () => {
      targetData.value.events.interactEvents.splice(index, 1)
    }
  })
}
</script>

<style lang="scss" scoped>
.mill-chart-target-data {
  :deep(pre) {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.n-input-group {
  height: 30px;
}

.no-data {
  flex-direction: column;
  width: 100%;
  img {
    width: 120px;
  }
}

:deep(.n-base-selection .n-base-selection-label) {
  height: 32px;
}
</style>
