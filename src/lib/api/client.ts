export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(body.error || 'Error inesperado', res.status)
  }

  return body as T
}
