import { CreateComponentType } from '@/packages/index.d'
import type { ExposedMethodType } from '@/packages/index.d'
import { commonExposedMethodEnum, commonExposedMethodNames } from '@/enums/methodEnum'
// @ts-ignore
window.curComp = {}
export const useExposedMethod = (targetComponent: CreateComponentType | any, componentExposedMethods: Array<ExposedMethodType>) => {
    // @ts-ignore
    window.curComp[targetComponent.id] = targetComponent
    debugger

    const show = (id:any) => {
        // @ts-ignore
        return window.curComp[id].attr.initializedVisible = true
    }

    const hide = () => {
        // @ts-ignore
        return window.curComp[id].attr.initializedVisible = false
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