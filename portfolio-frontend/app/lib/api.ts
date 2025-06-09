const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function fetchProjects() {
  const res = await fetch(`${BASE_URL}/api/get-projects`)
  if (!res.ok) throw new Error('Error al cargar proyectos')
  return res.json()
}

export async function fetchPosts() {
  const res = await fetch(`${BASE_URL}/api/get-posts`)
  if (!res.ok) throw new Error('Error al cargar posts')
  return res.json()
} 