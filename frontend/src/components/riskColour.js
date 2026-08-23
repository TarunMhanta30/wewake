/**
 * Single source of truth for risk -> colour.
 *
 * There is deliberately no green in this palette. "Low risk" reads as
 * calm navy, because a green tick on a fraud tool invites people to stop
 * reading — absence of a matched signal is not proof of safety.
 */

// For light surfaces: solid fills, text on white, borders.
const ON_LIGHT = {
  LOW: 'var(--ink)',
  CAUTION: 'var(--amber-dk)',
  HIGH: 'var(--orange)',
  DANGER: 'var(--alarm)',
}

// For the dark monitor panel, where amber needs to stay legible.
const ON_DARK = {
  LOW: 'var(--mist-2)',
  CAUTION: 'var(--amber)',
  HIGH: 'var(--orange)',
  DANGER: 'var(--alarm)',
}

export function riskColour(level) {
  return ON_LIGHT[level] || 'var(--slate)'
}

export function riskOnDark(level) {
  return ON_DARK[level] || 'var(--dim)'
}
