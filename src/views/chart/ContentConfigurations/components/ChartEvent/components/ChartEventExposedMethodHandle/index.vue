<template>
  <n-collapse-item title="组件方法列表" name="6">
    <template #header-extra>
      <n-space>
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-icon size="21" :depth="3">
              <help-outline-icon></help-outline-icon>
            </n-icon>
          </template>
        组件对外开放方法，可在组件交互控制时通过其它组件调用
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
    <n-table size="small" striped v-if="exposedMethods && exposedMethods.length">
      <thead>
        <tr>
          <th v-for="item in ['方法名', '说明']" :key="item">{{ item }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cItem, index) in exposedMethods" :key="index">
          <td>{{ `${cItem.value}()` }}</td>
          <td>{{ cItem.label }}</td>
        </tr>
      </tbody>
    </n-table>

    <!-- 弹窗 -->
    <n-modal class="go-chart-data-monaco-editor" v-bind:show="showModal" :mask-closable="false">
      <n-card :bordered="false" role="dialog" size="small" aria-modal="true" style="width: 1200px; height: 700px">
        <template #header>
          <n-space>
            <n-text>组件方法编辑器</n-text>
          </n-space>
        </template>

        <template #header-extra> </template>

        <n-layout style="height: 580px; padding-right: 20px"> </n-layout>

        <template #action>
          <n-space justify="space-between">
            <div class="go-flex-items-center">
              <n-tag :bordered="false" type="primary">
                <template #icon>
                  <n-icon :component="DocumentTextIcon" />
                </template>
                说明
              </n-tag>
              <n-text class="go-ml-2" depth="2">内部方法不可编辑，自定义方法可控制组件属性状态值</n-text>
            </div>

            <n-space>
              <n-button size="medium" @click="closeMethods">取消</n-button>
              <n-button size="medium" type="primary" @click="saveMethods">保存</n-button>
            </n-space>
          </n-space>
        </template>
      </n-card>
    </n-modal>

  </n-collapse-item>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { icon } from '@/plugins'
import { useChartInstanceStore } from '@/store/modules/chartInstanceStore/chartInstanceStore'
import { useTargetData } from '../../../hooks/useTargetData.hook'

const { HelpOutlineIcon, DocumentTextIcon, PencilIcon } = icon.ionicons5
const { targetData } = useTargetData()
const chartInstanceStore = useChartInstanceStore()

const exposedMethods = computed(() => {
  const instance = chartInstanceStore.getComponentInstance(targetData.value.id)
  return instance?.exposed?.getExposedMethods()  
})

// 受控弹窗
const showModal = ref(false)
// 关闭事件
const closeMethods = (rollback = true) => {
  showModal.value = false
}

// 新增事件
const saveMethods = async () => {
  await chartInstanceStore.reloadComponentInstance(targetData.value.id)
  closeMethods(false)
}

</script>
