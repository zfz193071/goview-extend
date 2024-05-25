import { ComponentInternalInstance } from 'vue'
import { defineStore } from 'pinia'
import { ChartInstanceStoreType, ChartInstanceCollectionsType } from './ChartInstanceStore.d'

// 使用纯Map对象来存储组件示例，而不是使用state
const collections: ChartInstanceCollectionsType = new Map()

export const useChartInstanceStore = defineStore({
    id: 'useChartInstanceStore',
    state: (): ChartInstanceStoreType => ({
        // state内的Map对象只用于记录组件示例是否存在(boolean)
        instanceMap: new Map(), 
        instanceReloading: [],
    }),
    getters: {
        getComponentInstanceList(): Array<ComponentInternalInstance | null> {
            return Array.from(collections.values())
        },
        getComponentInstanceMap(): ChartInstanceCollectionsType {
            return new Map(collections)
        },
        getComponentInstanceReloading(): string[] {
            return this.instanceReloading
        }
    },
    actions: {
        updateComponentInstance(id: string, instance: ComponentInternalInstance | null) {
            collections.set(id, instance)
            return this.instanceMap.set(id, !!instance)
        },
        getComponentInstance(id: string): ComponentInternalInstance | null | undefined {
            return collections.get(id)
        },
        async reloadComponentInstance(id: string, delay = 100) {
            return new Promise<void>((resolve) => {
                this.instanceReloading = [id]
                setTimeout(() => {
                    this.instanceReloading = []
                    resolve()
                }, delay)
            })
        }
    }
})