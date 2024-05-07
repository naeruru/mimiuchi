import cloneDeep from 'lodash.clonedeep'

export default function storeReset({ store }: any) {
  const initialState = cloneDeep(store.$state)
  store.$reset = () => store.$patch(($state: any) => {
    Object.assign($state, initialState)
  })
}
