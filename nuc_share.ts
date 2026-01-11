import type { App } from 'vue'

import {
  NucShare,
  NucShareCheckbox,
  NucShareDialog,
  NucSharePopover,
  NucShareRequestsItem,
  NucShareRequestsList,
  NucShareTabs,
} from '.'

export function registerNucShare(app: App<Element>): void {
  app
    .component('nuc-share', NucShare)
    .component('nuc-share-checkbox', NucShareCheckbox)
    .component('nuc-share-dialog', NucShareDialog)
    .component('nuc-share-popover', NucSharePopover)
    .component('nuc-share-requests-item', NucShareRequestsItem)
    .component('nuc-share-requests-list', NucShareRequestsList)
    .component('nuc-share-tabs', NucShareTabs)
}
