declare interface Window {
  // extend the window
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

interface list_item {
  title: string
  value: string
}

declare const __APP_NAME__: string
declare const __APP_VERSION__: string
