<template>
    <n-collapse-item title="组件对外属性" name="5">
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
          <n-button type="primary" tertiary size="small">
            <template #icon>
              <n-icon>
                <pencil-icon />
              </n-icon>
            </template>
            编辑
          </n-button>
        </n-space>
      </template>
      <setting-item-box :alone="true" v-if="readonlyExposedProps.length || definedExposedProps.length">
        <template #name>
          <n-text>绑定</n-text>
        </template>
        <n-select
          class="select-type-options"
          size="tiny"
          filterable
          placeholder="仅展示符合条件的组件"
          :options="readonlyExposedProps"
        />
      </setting-item-box>
    </n-collapse-item>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { icon } from '@/plugins'
import { SettingItemBox } from '@/components/Pages/ChartItemSetting'
import type { ExposedPropType } from '@/packages/index.d'
import { useChartInstanceStore } from '@/store/modules/chartInstanceStore/chartInstanceStore'
import { useTargetData } from '../../../hooks/useTargetData.hook'
import { ExposedPropEditTable } from './components/ExposedPropEditTable'

const { HelpOutlineIcon, DocumentTextIcon, PencilIcon } = icon.ionicons5
const { targetData } = useTargetData()
const chartInstanceStore = useChartInstanceStore()
const readonlyExposedProps = computed(() => {
  const instance = chartInstanceStore.getComponentInstance(targetData.value.id)
  return (instance?.exposed?.getExposedProps?.() || [])
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
