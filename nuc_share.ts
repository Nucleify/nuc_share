import type { App } from 'vue'

import { NucShareCheckbox, NucShareDialog } from '.'

export function registerNucShare(app: App<Element>): void {
  app
    .component('nuc-share-checkbox', NucShareCheckbox)
    .component('nuc-share-dialog', NucShareDialog)
}
