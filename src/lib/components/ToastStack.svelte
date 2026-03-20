<script lang="ts">
  import { onDestroy } from 'svelte'
  import type { Toast } from '../types'
  import { toastStore } from '../stores/toastStore'

  let toasts: Toast[] = []
  const unsubscribe = toastStore.subscribe((value) => (toasts = value))
  onDestroy(unsubscribe)
</script>

<div class="toast-stack">
  {#each toasts as toast (toast.id)}
    <div class={`toast ${toast.type}`}>
      <span style="flex:1">{toast.message}</span>
      <button class="btn ghost btn-icon btn-sm" on:click={() => toastStore.dismiss(toast.id)}>✕</button>
    </div>
  {/each}
</div>
