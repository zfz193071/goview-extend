import { CreateComponentType } from '@/packages/index.d'
import type { ExposedMethodType } from '@/packages/index.d'
import { commonExposedMethodEnum, commonExposedMethodNames } from '@/enums/methodEnum'
export const useExposedMethod = (targetComponent: CreateComponentType | any, componentExposedMethods: Array<ExposedMethodType>) => {

    const toggle = (visible: boolean) => {
        targetComponent.attr.initializedVisible = visible
    }

    const show = () => {
        return toggle(true)
    }

    const hide = () => {
        return toggle(false)
    }

    const componentExposed = componentExposedMethods.reduce((rtn, item) => ({
        ...rtn, 
        [item.value]: item.handler,
    }), {} as {[key: string]: Function})

    return {
        [commonExposedMethodEnum.SHOW]: show,
        [commonExposedMethodEnum.HIDE]: hide,
        ...componentExposed,
        getExposedMethods: (): Array<ExposedMethodType> => [
            {
                value: commonExposedMethodEnum.SHOW,
                label: commonExposedMethodNames[commonExposedMethodEnum.SHOW],
                handler: show
            },
            {
                value: commonExposedMethodEnum.HIDE,
                label: commonExposedMethodNames[commonExposedMethodEnum.HIDE],
                handler: hide
            },
            ...componentExposedMethods
        ]
    }
}