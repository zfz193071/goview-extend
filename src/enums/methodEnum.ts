
export enum commonExposedMethodEnum {
    SHOW = 'show',
    HIDE = 'hide',
    REFRESH = 'refresh'
}

export const commonExposedMethodNames: Record<commonExposedMethodEnum, string> = {
    [commonExposedMethodEnum.SHOW]: '显示',
    [commonExposedMethodEnum.HIDE]: '隐藏',
    [commonExposedMethodEnum.REFRESH]: '刷新数据',
}