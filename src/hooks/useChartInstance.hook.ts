import { onBeforeUnmount, getCurrentInstance } from 'vue'
import { useChartInstanceStore } from '@/store/modules/chartInstanceStore/chartInstanceStore'

export const useChartInstance = () => {
    
    const attachInstance = () => {
        const chartInstanceStore = useChartInstanceStore()
        const instance = getCurrentInstance()
        // @ts-ignore
        chartInstanceStore.updateComponentInstance(instance?.props.chartConfig.id, instance)
    }
    const detachInstance = () => {
        const chartInstanceStore = useChartInstanceStore()
        const instance = getCurrentInstance()
        // @ts-ignore
        chartInstanceStore.updateComponentInstance(instance?.props.chartConfig.id, null)
    }

    attachInstance()
    onBeforeUnmount(() => detachInstance())

    return {
        detachInstance,
        instance: getCurrentInstance(),
    }

}