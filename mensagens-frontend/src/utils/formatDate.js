// Formatação de datas amigável, sem dependências externas (Intl/Date nativos).
// O createdAt vem em ISO 8601 UTC; a conversão para o fuso local do usuário é
// feita automaticamente pelo Date/Intl.

/** True se duas datas caem no mesmo dia no fuso local. */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Rótulo amigável de dia para separadores: "Hoje", "Ontem",
 * "12 de junho" (ano corrente) ou "12 de junho de 2025" (outro ano).
 */
export function formatDayLabel(date) {
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()

  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate())
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86_400_000)

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'

  const sameYear = d.getFullYear() === now.getFullYear()
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(d)
}

/** Data + hora completas (para tooltip/hover): "12/06/2025 14:32". */
export function formatDateTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d)
}
