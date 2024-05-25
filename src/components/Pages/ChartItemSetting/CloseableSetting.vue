<template>
    <collapse-item name="组件关闭">
        <setting-item-box name="初始状态" v-if="!isGroup">
            <setting-item name="显示">
                <n-space>
                    <n-switch v-model:value="chartAttr.initializedVisible" size="small"></n-switch>
                </n-space>
            </setting-item>            
        </setting-item-box>
    </collapse-item>
</template>
  
<script setup lang="ts">
import { PropType } from 'vue'
import { PickCreateComponentType } from '@/packages/index.d'
import { CollapseItem, SettingItemBox, SettingItem } from '@/components/Pages/ChartItemSetting'


const props = defineProps({
    chartAttr: {
        type: Object as PropType<Omit<PickCreateComponentType<'attr'>, 'node' | 'conNode'>>,
        required: true
    },
    isGroup: {
        type: Boolean,
        required: false
    }
})


const closePositionOptions = [
    {
        value: 'top-left',
        label: '左上'
    },
    {
        value: 'top-right',
        label: '右上'
    },
]
</script>
  