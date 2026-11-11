import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GithubIcon, GoogleIcon } from './icons'

describe('provider icons', () => {
  it('renders a decorative Google mark', () => {
    const { container } = render(<GoogleIcon />)
    const icon = container.querySelector('svg')

    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).toHaveAttribute('focusable', 'false')
    expect(icon).toHaveAttribute('viewBox', '0 0 18 18')
  })

  it('renders a decorative GitHub mark', () => {
    const { container } = render(<GithubIcon />)
    const icon = container.querySelector('svg')

    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).toHaveAttribute('focusable', 'false')
    expect(icon).toHaveAttribute('viewBox', '0 0 16 16')
  })
})
