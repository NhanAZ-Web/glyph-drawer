<script lang="ts">
  export let open = false
  export let onClose: () => void
  export let onSend: (format: 'png' | 'json') => void

  function handleKey(event: KeyboardEvent) {
    if (event.key === 'Escape') onClose()
  }
</script>

{#if open}
  <div class="modal-backdrop" role="presentation" tabindex="-1" on:click={onClose} on:keydown={handleKey}>
    <div class="modal" role="dialog" aria-modal="true" tabindex="0" on:click|stopPropagation on:keydown={handleKey}>
      <div class="section-title">
        <span>Export & send to glyph</span>
        <span class="pill">Stub API</span>
      </div>
      <p style="margin-top: 0; color: var(--muted)">
        Files are mock-uploaded to glyph. When the real API is ready, replace the <code>uploadToGlyph</code> function.
      </p>
      <div class="row" style="justify-content: flex-end; gap: 10px;">
        <button class="btn ghost" on:click={onClose}>Close</button>
        <button class="btn" on:click={() => onSend('json')}>Send JSON</button>
        <button class="btn primary" on:click={() => onSend('png')}>Send PNG</button>
      </div>
    </div>
  </div>
{/if}

