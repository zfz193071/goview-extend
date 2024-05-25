<template>
    <n-collapse-item title="组件属性列表" name="5">
      <template #header-extra>
        <n-space>
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-icon size="21" :depth="3">
                <help-outline-icon></help-outline-icon>
              </n-icon>
            </template>
            组件对外开放属性，可在组件交互控制时通过其它组件事件修改
          </n-tooltip>
          <n-button type="primary" tertiary size="small" @click.stop="showModal = true">
            <template #icon>
              <n-icon>
                <pencil-icon />
              </n-icon>
            </template>
            编辑
          </n-button>
        </n-space>
      </template>
      <n-table size="small" striped v-if="readonlyExposedProps.length || definedExposedProps.length">
          <thead>
            <tr>
              <th v-for="item in ['类型', '属性字段', '说明']" :key="item">{{ item }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cItem, index) in [...readonlyExposedProps, ...definedExposedProps]" :key="index">
              <td>{{ cItem.isolate > 0 ? '内部属性' : '自定义属性' }}</td>
              <td>{{ cItem.value }}</td>
              <td>{{ cItem.label }}</td>
            </tr>
          </tbody>
        </n-table>
    </n-collapse-item>

    <!-- 弹窗 -->
    <n-modal class="go-chart-data-monaco-editor" v-bind:show="showModal" :mask-closable="false">
      <n-card :bordered="false" role="dialog" size="small" aria-modal="true" style="width: 1200px; height: 700px">
        <template #header>
          <n-space>
            <n-text>组件属性编辑器</n-text>
          </n-space>
        </template>

        <template #header-extra> </template>

        <n-layout style="height: 580px; padding-right: 20px">
          <exposed-prop-edit-table
            :readonlyValue="readonlyExposedProps"
            v-model:modelValue="definedExposedProps"
          ></exposed-prop-edit-table>
        </n-layout>

        <template #action>
          <n-space justify="space-between">
            <div class="go-flex-items-center">
              <n-tag :bordered="false" type="primary">
                <template #icon>
                  <n-icon :component="DocumentTextIcon" />
                </template>
                说明
              </n-tag>
              <n-text class="go-ml-2" depth="2">内部属性只读，自定义属性可用于数据请求参数「写法：${props.xxx} 」及其它组件交互控制</n-text>
            </div>

            <n-space>
              <n-button size="medium" @click="closeProps">取消</n-button>
              <n-button size="medium" type="primary" @click="saveProps">保存</n-button>
            </n-space>
          </n-space>
        </template>
      </n-card>
    </n-modal>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { icon } from '@/plugins'
import type { ExposedPropType } from '@/packages/index.d'
import { useChartInstanceStore } from '@/store/modules/chartInstanceStore/chartInstanceStore'
import { useTargetData } from '../../../hooks/useTargetData.hook'
import { ExposedPropEditTable } from './components/ExposedPropEditTable'

const { HelpOutlineIcon, DocumentTextIcon, PencilIcon } = icon.ionicons5
const { targetData } = useTargetData()
const chartInstanceStore = useChartInstanceStore()
const readonlyExposedProps = computed(() => {
  const instance = chartInstanceStore.getComponentInstance(targetData.value.id)
  return (instance?.exposed?.getExposedProps() || [])
    .filter((x: ExposedPropType) => x.isolate > 0)
})

const { definedExposedProps } = toRefs(cloneDeep(targetData.value))

// 受控弹窗
const showModal = ref(false)

// 关闭事件
const closeProps = (rollback = true) => {
  if (rollback) {
    definedExposedProps.value = []
  }
  showModal.value = false
}

// 新增事件
const saveProps = async () => {
  targetData.value.definedExposedProps = definedExposedProps.value
  await chartInstanceStore.reloadComponentInstance(targetData.value.id)
  closeProps(false)
}
</script>
