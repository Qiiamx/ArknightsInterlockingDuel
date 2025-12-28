import { ref, watch, unref } from 'vue'

// 从当前值平滑过渡到目标值
export function useSmoothNumber(source, {
  duration = 600,      // 一次动画时长(ms)
  step = 1             // 每一步最小变化量，防止太小的数字动画太慢
} = {}) {
  const current = ref(unref(source))   // 当前显示值
  let rafId = null
  let start = 0
  let from = 0
  let to = 0

  // 每次 source 变化就启动新动画
  watch(
    source,
    newVal => {
      // 如果正在动画，先停掉
      if (rafId) cancelAnimationFrame(rafId)

      from = current.value
      to = newVal
      start = performance.now()

      const clamp = v => (to > from ? Math.min(v, to) : Math.max(v, to))

      const tick = () => {
        const t = (performance.now() - start) / duration
        if (t >= 1) {
          current.value = to
          rafId = null
          return
        }
        // 线性插值，你也可以换成 easeOut 等缓动
        const next = from + (to - from) * t
        current.value = clamp(Math.round(next / step) * step)
        rafId = requestAnimationFrame(tick)
      }
      tick()
    },
    { immediate: true }
  )

  return current
}