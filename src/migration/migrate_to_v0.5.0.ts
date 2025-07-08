import { useAppearanceStore } from "@/stores/appearance"
import { useOSCStore } from "@/stores/osc"

export default function migrate_to_v0_5_0() {
  const appearanceStore = useAppearanceStore()
  const oscStore = useOSCStore()

  // Revalidate store refs for commit 6ad0138193a8c9bc406bf22d7088b33f57928916
  appearanceStore.$patch(state => {
    if (typeof state.text.outline_size !== 'number') {
      const parsed = parseInt(state.text.outline_size);
      state.text.outline_size = isNaN(parsed) ? 0 : parsed;
    }

    if (typeof state.text.font_size !== 'number') {
      const parsed = parseInt(state.text.font_size);
      state.text.font_size = isNaN(parsed) ? 0 : parsed;
    }

    if (typeof state.text.hide_after !== 'number') {
      const parsed = parseInt(state.text.hide_after);
      state.text.hide_after = isNaN(parsed) ? 0 : parsed;
    }

    if (typeof state.text.fade_time !== 'number') {
      const parsed = parseInt(state.text.fade_time);
      state.text.fade_time = isNaN(parsed) ? 0 : parsed;
    }
  })

  oscStore.$patch(state => {
    if (typeof state.port !== 'number') {
      const parsed = parseInt(state.port);
      state.port = isNaN(parsed) ? 0 : parsed;
    }
  })
}
