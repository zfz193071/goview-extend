import { Ref, ref } from 'vue'
import { CreateComponentType } from '@/packages/index.d'
import type { ExposedPropType, PropValueType } from '@/packages/index.d'

export const useExposedProp = (targetComponent: CreateComponentType, componentExposedPropList: Array<ExposedPropType>) => {

    const { definedExposedProps } = targetComponent
    const definedExposedPropList = definedExposedProps.map((prop) => {
        return {
            ...prop,
            ref: ref(prop.defaultValue),
            getValue: () => {
                return prop.ref!.value
            },
            setValue: (value: PropValueType) => {
                prop.ref!.value = value
            }
        }
    })

    const allExposedList = [...componentExposedPropList, ...definedExposedPropList]
    const allExposed = allExposedList.reduce((rtn, item) => ({
        ...rtn, 
        [item.value]: item.ref!
    }), {} as {[key: string]: Ref<PropValueType>})

    return {
        ...allExposed,
        getExposedProps: (): Array<ExposedPropType> => {
            return allExposedList.map((item) => {
                return {
                    ...item,
                    getValue: () => {
                        return item.ref!.value
                    },
                    setValue: (value: PropValueType) => {
                        item.ref!.value = value
                    }
                }
            })
        }
    }

}