<template>
  <n-tabs :type="option.value.tabType" @update:value="onChange" :default-value="option.value.tabLabel">
    <n-tab v-for="(item, index) in option.value.dataset" :name="item.label" :key="index"> {{ item.label }} </n-tab>
  </n-tabs>
</template>

<script setup lang="ts">
import { PropType, toRefs, shallowReactive, watch } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { CreateComponentType } from '@/packages/index.d'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { useChartInteract, useExposedMethod } from '@/hooks'
import { InteractEventOn } from '@/enums/eventEnum'
import type { ExposedMethodType } from '@/packages/index.d'
import { ComponentInteractParamsEnum } from './interact'

const props = defineProps({
  chartConfig: {
    type: Object as PropType<CreateComponentType>,
    required: true
  }
})
const test = (value: any) => console.info('test : ==================>', JSON.stringify(value))
const componentExposedMethods: Array<ExposedMethodType> = [
  {
    value: 'test',
    label: '测试',
    handler: test
  }
]
const { w, h } = toRefs(props.chartConfig.attr)
const option = shallowReactive({
  value: cloneDeep(props.chartConfig.option)
})
defineExpose({
  // 组件对外暴露的方法
  ...useExposedMethod(props.chartConfig, componentExposedMethods)
})
// 监听事件改变
const onChange = (v: string) => {
  if (v === undefined) return
  const selectItem = option.value.dataset.find((item: { label: string; value: any }) => item.label === v)
  // 存储到联动数据
  useChartInteract(
    props.chartConfig,
    useChartEditStore,
    { [ComponentInteractParamsEnum.DATA]: selectItem.value },
    InteractEventOn.CHANGE
  )
}

// 手动更新
watch(
  () => props.chartConfig.option,
  (newData: any) => {
    option.value = newData
    onChange(newData.tabValue)
  },
  {
    immediate: true,
    deep: true
  }
)
</script>