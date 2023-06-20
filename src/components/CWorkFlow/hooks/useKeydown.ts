import { onMounted, onUnmounted } from "vue";

export default function useKeydown(cb) {
  function onKeyDown(evt: Event) {
    cb(evt);
  }

  onMounted(() => {
    document.addEventListener("keydown", onKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", onKeyDown);
  });

  return {};
}
