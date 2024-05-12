export default function storeReset({ store }: any) {
  const initialState = JSON.parse(JSON.stringify(store.$state))
  store.$reset = () => store.$patch(($state: any) => {
    $state = Object.assign($state, initialState)
  })
}
