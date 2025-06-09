// app/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { fetchProjects, fetchPosts } from '@/lib/api'
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SparklesCore } from '@/components/ui/sparkles'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [projects, posts] = await Promise.all([
      fetchProjects(),
      fetchPosts(),
    ])

    return { projects, posts }
  },
  component: IndexPage,
})

export default function IndexPage() {
  const { projects, posts } = Route.useLoaderData()
  const heroRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const projectsRef = useRef<HTMLDivElement>(null)
  const postsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } })

    tl.fromTo(heroRef.current, { y: 100, opacity: 0 }, { y: 0, opacity: 1 })
      .fromTo(aboutRef.current, { x: -100, opacity: 0 }, { x: 0, opacity: 1 }, "-=0.5")
      .fromTo(projectsRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1 }, "-=0.5")
      .fromTo(postsRef.current, { x: 100, opacity: 0 }, { x: 0, opacity: 1 }, "-=0.5")
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white px-6 py-12 space-y-24">
      <section ref={heroRef} className="relative flex flex-col items-center justify-center text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          Victor Tejada
        </h1>
        <p className="text-lg max-w-xl mx-auto text-muted-foreground">
          Ingeniero de software apasionado por crear experiencias modernas usando Go + React.
        </p>
        <Button className="mt-4">Conoce más</Button>
        <div className="w-full h-40 absolute bottom-0">
          <SparklesCore background="transparent" minSize={0.4} maxSize={1.2} particleDensity={80} className="w-full h-full" />
        </div>
      </section>

      <section ref={projectsRef} className="space-y-12">
        <h2 className="text-3xl font-bold">📦 Proyectos Destacados</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Card key={project.id} className="bg-zinc-800 border-none">
              <CardContent className="space-y-2 p-4">
                <h3 className="text-xl font-semibold">{project.name}</h3>
                <p className="text-sm text-muted-foreground">{project.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section ref={postsRef} className="space-y-12">
        <h2 className="text-3xl font-bold">📝 Últimas Publicaciones</h2>
        <div className="space-y-4">
          {posts.map((post: any) => (
            <div key={post.id} className="border-b border-zinc-700 pb-4">
              <h4 className="text-lg font-semibold">{post.subject}</h4>
              <p className="text-sm text-muted-foreground">{post.content}</p>
            </div>
          ))}
        </div>
      </section>

      <section ref={aboutRef} className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Sobre mí</h2>
        <p className="text-muted-foreground leading-relaxed">
          Me encanta combinar backend sólido con interfaces modernas. Este portafolio está construido con Go, TanStack Start, React 19 y animaciones suaves con GSAP.
        </p>
      </section>
    </div>
  )
}
