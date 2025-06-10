import { ModeToggle } from "./mode-toggle"

export function Navbar() {
  return (
    <header className="flex items-center justify-between py-4">
      <h1 className="text-xl font-bold tracking-tight">VT</h1>
      <nav className="flex items-center gap-6 text-sm">
        <a href="#projects" className="hover:underline">Proyectos</a>
        <a href="#posts" className="hover:underline">Blog</a>
        <a href="#about" className="hover:underline">Sobre mí</a>
        <ModeToggle />
      </nav>
    </header>
  )
}
