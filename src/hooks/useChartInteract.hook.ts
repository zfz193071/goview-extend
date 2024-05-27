import { toRefs } from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { isPreview } from '@/utils'
import { CreateComponentType } from '@/packages/index.d'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { useChartInstanceStore } from '@/store/modules/chartInstanceStore/chartInstanceStore'
import type { ExposedPropType, ExposedMethodType } from '@/packages/index.d'
// 获取类型
type ChartEditStoreType = typeof useChartEditStore

// Params 参数修改触发 api 更新图表请求
export const useChartInteract = (
  chartConfig: CreateComponentType,
  useChartEditStore: ChartEditStoreType,
  param: { [T: string]: any },
  interactEventOn: string
) => {
  // if (!isPreview()) return
  const chartEditStore = useChartEditStore()
  const chartInstanceStore = useChartInstanceStore()
  const { interactEvents } = chartConfig.events
  const fnOnEvent = interactEvents.filter(item => {
    return item.interactOn === interactEventOn
  })

  if (fnOnEvent.length === 0) return
  fnOnEvent.forEach(item => {

    const globalConfigPindAprndex = chartEditStore.requestGlobalConfig.requestDataPond.findIndex(cItem =>
      cItem.dataPondId === item.interactComponentId
    )
    debugger
    if (globalConfigPindAprndex !== -1) {
      const { Params, Header } = toRefs(chartEditStore.requestGlobalConfig.requestDataPond[globalConfigPindAprndex].dataPondRequestConfig.requestParams)

      Object.keys(item.interactFn).forEach(key => {
        if (key in Params.value) {
          Params.value[key] = param[item.interactFn[key]]
        }
        if (key in Header.value) {
          Header.value[key] = param[item.interactFn[key]]
        }
      })
    } else {
      const index = chartEditStore.fetchTargetIndex(item.interactComponentId)
      if (index === -1) return
      const component = chartEditStore.componentList[index]
      const { Params, Header } = toRefs(chartEditStore.componentList[index].request.requestParams)

      Object.keys(item.interactFn).forEach(key => {
        if (key in Params.value) {
          Params.value[key] = param[item.interactFn[key]]
        }
        if (key in Header.value) {
          Header.value[key] = param[item.interactFn[key]]
        }
      })

      // 处理关联组件属性及方法
    const instance = chartInstanceStore.getComponentInstance(component.id)
    if (!instance) {
      return
    }

    const props = instance.exposed?.getExposedProps?.()
    let setValue = null
    if (item.interactProp && item.interactProp.prop && props && props.length) {
      const targetProp = props.find((x: ExposedPropType) => x.value === item.interactProp.prop)
      targetProp ? (setValue = targetProp.setValue) : null
    }
    let setValueFilter = null
    if (item.interactProp && item.interactProp.handler) {
      setValueFilter = new Function('eventData', 'targetPropSetter', item.interactProp.handler)
    }
    if (setValue && !setValueFilter) {
      setValue.call(null, cloneDeep(param))
    }
    if (setValue && setValueFilter) {
      setValueFilter(cloneDeep(param), setValue)
    }

    function executeMethod(methods:any) {
      let method = null
      if (item.interactMethod && item.interactMethod.method && methods && methods.length) {
        const targetMethod = methods.find((x: ExposedMethodType) => x.value === item.interactMethod.method)
        targetMethod ? (method = targetMethod.handler) : null
      }
      let methodFilter = null
      if (item.interactMethod && item.interactMethod.handler) {
        methodFilter = new Function('eventData', 'targetMethod', item.interactMethod.handler)
      }
      if (method && !methodFilter) {
        method.call(null, cloneDeep(param))
      }
      if (method && methodFilter) {
        methodFilter(cloneDeep(param), method)
      }
    }
    // @ts-ignore
    const tabKeys = Object.keys(item.interactTabs)
    if (tabKeys.length) {
      const chosenIndex = tabKeys.findIndex(a => param.data)
      // @ts-ignore
      methodsArr = chartConfig.tabMethods[tabKeys[chosenIndex]]
      // @ts-ignore
      methodsArr.forEach(methods => {
        executeMethod(methods)
      })
    } else {
      const methods = instance.exposed?.getExposedMethods()
      executeMethod(methods)
    }
    
    }
  })
}
// 联动事件触发的 type 变更时，清除当前绑定内容
export const clearInteractEvent = (chartConfig: CreateComponentType) => {

}
