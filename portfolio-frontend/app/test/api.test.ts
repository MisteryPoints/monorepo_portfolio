import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchProjects, fetchPosts, fetchTranslations } from '@/lib/api'

const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
})

describe('API functions', () => {
  it('fetchProjects returns data on success', async () => {
    const mockData = [{ id: '1', name: 'Project 1' }]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const result = await fetchProjects()
    expect(result).toEqual(mockData)
    expect(mockFetch).toHaveBeenCalledWith('/api/get-projects')
  })

  it('fetchProjects throws on error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })
    await expect(fetchProjects()).rejects.toThrow('Error al cargar proyectos')
  })

  it('fetchPosts returns data on success', async () => {
    const mockData = [{ id: '1', title: 'Post 1' }]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const result = await fetchPosts()
    expect(result).toEqual(mockData)
    expect(mockFetch).toHaveBeenCalledWith('/api/get-posts')
  })

  it('fetchTranslations passes lang parameter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ key: 'value' }),
    })

    await fetchTranslations('es')
    expect(mockFetch).toHaveBeenCalledWith('/api/get-translations?lang=es')
  })
})
