import { ComponentInternalInstance } from 'vue'

export type ChartInstanceCollectionsType = Map<string, ComponentInternalInstance | null>
export type ChartInstanceCollectionsFacadeType = Map<string, boolean>

export interface ChartInstanceStoreType {
    instanceMap: ChartInstanceCollectionsFacadeType,
    instanceReloading: string[]
}