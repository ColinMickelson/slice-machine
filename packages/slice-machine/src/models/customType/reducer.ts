import equal from 'fast-deep-equal'
import { CustomTypeState, CustomTypeStatus } from '@models/ui/CustomTypeState'
import { Tab } from '@models/common/CustomType/tab'

import Actions from './actions'
import { Widget } from '@models/common/widgets'
import { Group, GroupWidget, GroupAsArray,} from '@models/common/CustomType/group'
import { SliceZone, SliceZoneAsArray } from '@models/common/CustomType/sliceZone'
import { CustomType } from '@lib/models/common/CustomType'

export default function reducer(prevState: CustomTypeState, action: { type: string, payload?: unknown }): CustomTypeState {
  const result = ((): CustomTypeState => {
    switch(action.type) {
      case Actions.Reset: {
        return {
          ...prevState,
          current: prevState.initialCustomType,
          mockConfig: prevState.initialMockConfig
        }
      }
      case Actions.CreateTab: {
        const { id } = action.payload as { id: string }
        if (prevState.current.tabs.find(e => e.key === id)) {
          return prevState
        }
        return {
          ...prevState,
          current: {
            ...prevState.current,
            tabs: [...prevState.current.tabs, Tab.init(id)]
          }
        }
      }
      case Actions.Save: {
        const { state } = action.payload as { state: CustomTypeState }
        return {
          ...state,
          initialCustomType: state.current,
          initialMockConfig: state.mockConfig,
        }
      }
      case Actions.Push: return {
        ...prevState,
        initialCustomType: prevState.current,
        remoteCustomType: prevState.current
      }
      case Actions.AddWidget: {
        const { tabId, widget, id } = action.payload as { tabId: string, widget: Widget | GroupWidget, id: string }
        return CustomTypeState.updateTab(prevState, tabId)(tab => Tab.addWidget(tab, id, widget))
      }
      case Actions.RemoveWidget: {
        const { tabId, id } = action.payload as { tabId: string, id: string }
        return CustomTypeState.updateTab(prevState, tabId)(tab => Tab.removeWidget(tab, id))
      }
      case Actions.ReplaceWidget: {
        const { tabId, previousKey, newKey, value } = action.payload as { tabId: string, previousKey: string, newKey: string, value: Widget | GroupAsArray }
        return CustomTypeState.updateTab(prevState, tabId)(tab => Tab.replaceWidget(tab, previousKey, newKey, value as Widget))
      }
      case Actions.ReorderWidget: {
        const { tabId, start, end } = action.payload as { tabId: string, start: number, end: number }
        return CustomTypeState.updateTab(prevState, tabId)(tab => Tab.reorderWidget(tab, start, end))
      }
      case Actions.DeleteTab: {
        const { tabId } = action.payload as { tabId: string }
        return CustomTypeState.deleteTab(prevState, tabId)
      }
      case Actions.CreateSliceZone: {
        const { tabId } = action.payload as { tabId: string }

        const tabIndex = prevState.current.tabs.findIndex(t => t.key === tabId)
        if (tabIndex === -1) {
          console.error(`No tabId ${tabId} found in tabs`)
          return prevState
        }

        const existingSliceZones = CustomType.getSliceZones(prevState.current).filter(e => e)

        function findAvailableKey(startI: number, existingSliceZones: (SliceZoneAsArray | null)[]) {
          for (let i = startI; i < Infinity; i++) {
            const key = `slices${i.toString()}`
            if (!existingSliceZones.find(e => e?.key === key)) {
              return i
            }
          }
          return -1
        }
        return CustomTypeState.updateTab(prevState, tabId)(tab => {
          const i = findAvailableKey(tabIndex, existingSliceZones)
          return Tab.createSliceZone(tab, `slices${(i !== 0 ? i.toString() : '')}`)
        })
      }
      case Actions.DeleteSliceZone: {
        const { tabId } = action.payload as { tabId: string }
        return CustomTypeState.updateTab(prevState, tabId)(tab => Tab.deleteSliceZone(tab))
      }
      case Actions.AddSharedSlice: {
        const { tabId, sliceKey } = action.payload as { tabId: string, sliceKey: string }
        return CustomTypeState.updateTab(prevState, tabId)
          (tab => Tab.updateSliceZone(tab)((sliceZone: SliceZoneAsArray) => SliceZone.addSharedSlice(sliceZone, sliceKey)))
      }
      case Actions.ReplaceSharedSlices: {
        const { tabId, sliceKeys } = action.payload as { tabId: string, sliceKeys: [string] }
        return CustomTypeState.updateTab(prevState, tabId)
          (tab => Tab.updateSliceZone(tab)((sliceZone: SliceZoneAsArray) => SliceZone.replaceSharedSlice(sliceZone, sliceKeys)))
      }
      case Actions.RemoveSharedSlice: {
        const { tabId, sliceKey } = action.payload as { tabId: string, sliceKey: string }
        return CustomTypeState.updateTab(prevState, tabId)
          (tab => Tab.updateSliceZone(tab)((sliceZone: SliceZoneAsArray) => SliceZone.removeSharedSlice(sliceZone, sliceKey)))
      }
      case Actions.UpdateWidgetMockConfig:
        return {
        ...prevState,
        mockConfig: (action.payload as any)
      }

      case Actions.DeleteWidgetMockConfig:
        return {
        ...prevState,
        mockConfig: (action.payload as any)
      }
      case Actions.GroupAddWidget: {
        const { tabId, groupId, id, widget } = action.payload as { tabId: string, groupId: string, id: string, widget: Widget }
        return CustomTypeState.updateTab(prevState, tabId)
          (tab => Tab.updateGroup(tab, groupId)((group: GroupAsArray) => Group.addWidget(group, { key: id, value: widget })))
      }
      case Actions.GroupReplaceWidget: {
        const { tabId, groupId, previousKey, newKey, value } = action.payload as { tabId: string, groupId: string, previousKey: string, newKey: string, value: Widget }
        return CustomTypeState.updateTab(prevState, tabId)
          (tab => Tab.updateGroup(tab, groupId)((group: GroupAsArray) => Group.replaceWidget(group, previousKey, newKey, value)))
      }
      case Actions.GroupDeleteWidget: {
        const { tabId, groupId, key } = action.payload as { tabId: string, groupId: string, key: string }
        return CustomTypeState.updateTab(prevState, tabId)
          (tab => Tab.updateGroup(tab, groupId)((group: GroupAsArray) => Group.deleteWidget(group, key)))
      }
      case Actions.GroupReorderWidget: {
        const { tabId, groupId, start, end } = action.payload as { tabId: string, groupId: string, start: number, end: number }
        return CustomTypeState.updateTab(prevState, tabId)
          (tab => Tab.updateGroup(tab, groupId)((group: GroupAsArray) => Group.reorderWidget(group, start, end )))
      }
      default: throw new Error("Invalid action.")
    }
  })()

  return {
    ...result,
    poolOfFieldsToCheck: CustomTypeState.getPool(result.current.tabs),
    __status: (() => {
      if (!result.remoteCustomType) {
        return CustomTypeStatus.New
      }
      if (equal(result.current, result.remoteCustomType)) {
        return CustomTypeStatus.Synced
      }
      return CustomTypeStatus.Modified
    })(),
    isTouched: !equal(result.initialCustomType, result.current) || !equal(result.initialMockConfig, result.mockConfig)
  }
}