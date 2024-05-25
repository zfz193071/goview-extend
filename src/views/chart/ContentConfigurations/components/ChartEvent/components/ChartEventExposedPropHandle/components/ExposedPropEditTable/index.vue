<template>
  <n-table class="go-request-header-table-box" :single-line="false" size="small">
    <thead>
      <tr>
        <th></th>
        <th>类型</th>
        <th>属性字段</th>
        <th>默认值</th>
        <th>说明</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <!-- 只读属性 -->
      <tr v-for="(item, index) in readonlyValue" :key="index">
        <td>
          {{ index + 1 }}
        </td>
        <td>
          <n-select
            size="small"
            v-model:value="item.isolate"
            :options="isolateTrueOptions"
            :clearable="false"
            :disabled="true"
          ></n-select>
        </td>
        <td>
          <n-input :value="item.value" :disabled="true" type="text" size="small" />
        </td>
        <td>
          <n-input :value="item.defaultValue" :disabled="true" type="text" size="small" />
        </td>
        <td>
          <n-input :value="item.label" :disabled="true" type="text" size="small" />
        </td>
        <td style="width: 80px"></td>
      </tr>

      <!-- 自定义属性 -->
      <tr v-for="(item, index) in tableArray.content" :key="index">
        <td>
          {{ readonlyValue.length + index + 1 }}
        </td>
        <td>
          <n-select
            size="small"
            v-model:value="item.isolate"
            :options="isolateFalseOptions"
            :clearable="false"
          ></n-select>
        </td>
        <td>
          <n-input v-model:value="item.value" :disabled="editDisabled" type="text" size="small" @blur="blur" />
        </td>
        <td>
          <n-input v-model:value="item.defaultValue" :disabled="editDisabled" type="text" size="small" @blur="blur" />
        </td>
        <td>
          <n-input v-model:value="item.label" :disabled="editDisabled" type="text" size="small" @blur="blur" />
        </td>
        <td>
          <div style="width: 80px">
            <n-button class="go-ml-2" type="primary" size="small" ghost :disabled="editDisabled" @click="add(index)"
              >+</n-button
            >
            <n-button
              class="go-ml-2"
              type="warning"
              size="small"
              ghost
              :disabled="editDisabled"
              @click="remove(index)"
            >
              -
            </n-button>
          </div>
        </td>
      </tr>
    </tbody>
  </n-table>
</template>

<script setup lang="ts">
import { PropType, watch, ref, reactive } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import type { ExposedPropType } from '@/packages/index.d'

interface ValidateExposedPropType extends ExposedPropType {
  error: boolean
}

const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  readonlyValue: {
    type: Array as PropType<Array<ExposedPropType>>,
    required: true,
    default: () => {}
  },
  modelValue: {
    type: Array as PropType<Array<ExposedPropType>>,
    required: true,
    default: () => {}
  },
  editDisabled: {
    type: Boolean,
    required: false,
    default: false
  }
})

const tableArray = reactive<{
  content: ValidateExposedPropType[]
}>({ content: [] })

const isolateTrueOptions = [
  {
    label: '内部属性',
    value: 1
  },
]

const isolateFalseOptions = [
  {
    label: '自定义属性',
    value: 0
  }
]

// 默认表格
const defaultItem: ValidateExposedPropType = {
  isolate: 0,
  value: '',
  label: '',
  defaultValue: '',
  error: false
}

const blur = () => {
  let successNum = 0
  tableArray.content.forEach(item => {
    if ((item.value !== '' && item.label === '') || (item.value === '' && item.label !== '')) {
      // 错误
      item.error = true
    } else {
      // 正确
      successNum++
      item.error = false
    }
  })
  // 验证是否全部通过
  if (successNum == tableArray.content.length) {
    // 转换数据成对象
    const updateObj: ExposedPropType[] = []
    tableArray.content.forEach((item: typeof defaultItem) => {
      if (item.value && item.label) {
        updateObj.push({
          isolate: 0,
          value: item.value,
          label: item.label,
          defaultValue: item.defaultValue,
        })
      }
    })
    emits('update:modelValue', updateObj)
  }
}

// 新增
const add = (index: number) => {
  tableArray.content.splice(index + 1, 0, {...defaultItem})
}

// 减少
const remove = (index: number) => {
  if (tableArray.content.length !== 0) {
    tableArray.content.splice(index, 1)
  }
  blur()
}

// 监听选项
watch(
  () => props.modelValue,
  (newVal: ExposedPropType[]) => {
    tableArray.content = []
    // 默认值
    if (!newVal.length) {
      tableArray.content = [cloneDeep(defaultItem)]
      return
    }

    newVal.forEach((item: ExposedPropType) => {
      tableArray.content.push({
        isolate: 0,
        value: item.value,
        label: item.label,
        defaultValue: item.defaultValue,
        error: false
      })
    })
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<style lang="scss">
@include go('request-header-table-box') {
  background-color: rgba(0, 0, 0, 0);
  @include deep() {
    .n-data-table .n-data-table-td {
      background-color: rgba(0, 0, 0, 0);
    }
    .add-btn-box {
      width: 100%;
      display: flex;
      justify-content: center;
      .add-btn {
        width: 300px;
      }
    }
  }
}
</style>
