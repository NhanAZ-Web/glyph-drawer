import { describe, expect, it } from 'vitest'
import EmptyState from './lib/components/EmptyState.svelte'

describe('UI smoke', () => {
  it('shows empty state copy', () => {
    const target = document.createElement('div')
    document.body.appendChild(target)
    const comp = new EmptyState({ target })
    expect(target.textContent).toContain('Bat dau ve pixel')
    comp.$destroy?.()
  })
})
