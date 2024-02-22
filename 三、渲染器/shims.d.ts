/// <reference types="./api-g.d.ts" />
/// <reference types="./event-dom-g.d.ts" />

export type * from './types/shims.d.ts'

import type { RendererConfig, RendererEx } from './types/shims.d.ts'

declare function _factory<
  ET = EventTarget,
  HN extends ET = Node,
  Ele extends HN = Element,
  ParentN extends HN = ParentNode,
  EleNS extends Ele = HTMLElement,
  Doc extends HN = Document
>(option: RendererConfig<ET, HN, Ele, ParentN, EleNS, Doc>): RendererEx<HN, Ele>

declare const factory: typeof _factory & { version: string }

declare const option: RendererConfig

export { factory, option }
