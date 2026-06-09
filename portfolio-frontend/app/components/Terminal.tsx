
import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { useTranslation } from '@/lib/translations';

interface FSNode {
  type: 'file' | 'dir';
  content?: string;
  children?: string[];
}

const virtualFS: Record<string, FSNode> = {
  '/': { type: 'dir', children: ['projects/', 'blog/', 'skills/', 'contact/', 'about.txt', 'cv.pdf'] },
  '/projects': { type: 'dir', children: ['go-api.txt', 'react-dashboard.txt', 'data-pipeline.txt', 'portfolio.txt'] },
  '/projects/go-api.txt': { type: 'file', content: 'Go REST API with Gorilla Mux + GORM\n- High-throughput gRPC layer handling 50K+ req/s\n- PostgreSQL with optimized queries (15ms avg response)\n- CI/CD with GitHub Actions, Docker, Kubernetes' },
  '/projects/react-dashboard.txt': { type: 'file', content: 'React Dashboard with TanStack Query\n- Server-side rendering with TanStack Start\n- Framer Motion animations reducing bounce rate 25%\n- TypeScript, Tailwind CSS, shadcn/ui' },
  '/projects/data-pipeline.txt': { type: 'file', content: 'Automated ETL Data Pipeline\n- Python/SAS processing 1M+ daily records\n- Reduced manual processing time by 60%\n- Real-time reporting with predictive analytics' },
  '/projects/portfolio.txt': { type: 'file', content: 'Full-Stack Engineering Portfolio\n- Go backend + React frontend (TanStack Start)\n- PostgreSQL (Neon.tech), Cloudinary\n- EN/ES i18n, dark/light theme, admin CRUD panel' },
  '/blog': { type: 'dir', children: ['system-design.txt', 'go-vs-node.txt', 'optimization.txt'] },
  '/blog/system-design.txt': { type: 'file', content: 'System Design: Scaling to 1M Users\n- Load balancing, caching strategies (Redis)\n- Database sharding and replication\n- Microservices vs monolith trade-offs' },
  '/blog/go-vs-node.txt': { type: 'file', content: 'Go vs Node.js for Backend Services\n- Go: 4.2GHz CPU, 64GB RAM, 10ms latency\n- Node.js: faster prototyping, rich ecosystem\n- Decision framework for tech selection' },
  '/blog/optimization.txt': { type: 'file', content: 'Database Optimization Techniques\n- Index strategies, query planning (15ms avg)\n- Connection pooling, prepared statements\n- Migrating from 200ms to 15ms response time' },
  '/skills': { type: 'dir', children: ['frontend.txt', 'backend.txt', 'devops.txt', 'languages.txt'] },
  '/skills/frontend.txt': { type: 'file', content: 'Frontend Stack\n- React 18, TypeScript, TanStack Start\n- Framer Motion, GSAP, Tailwind CSS v4\n- shadcn/ui component library' },
  '/skills/backend.txt': { type: 'file', content: 'Backend Stack\n- Go, Gorilla Mux, GORM\n- Node.js, Express, NestJS\n- RESTful & gRPC API design' },
  '/skills/devops.txt': { type: 'file', content: 'DevOps & Infrastructure\n- Docker, Kubernetes, CI/CD\n- PostgreSQL, Redis, Cloudinary\n- Cloud deployment (Neon.tech, AWS)' },
  '/skills/languages.txt': { type: 'file', content: 'Programming Languages\n- Go, TypeScript, JavaScript\n- Python, SAS, SQL\n- Java, C#, .NET' },
  '/contact': { type: 'dir', children: ['email.txt', 'phone.txt', 'social.txt'] },
  '/contact/email.txt': { type: 'file', content: 'Email: info@victortejada.dev' },
  '/contact/phone.txt': { type: 'file', content: 'Phone/WhatsApp: +1 (809) 729-8392\nWhatsApp: https://wa.me/18097298392' },
  '/contact/social.txt': { type: 'file', content: 'LinkedIn: www.linkedin.com/in/devpoint\nPortfolio: www.victortejada.dev\nGitHub: github.com/devpoint' },
};

const Terminal = () => {
  const { t } = useTranslation();
  const [history, setHistory] = useState<string[]>([t('terminal.welcome')]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState('/');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const resolvePath = (p: string): string => {
    if (p.startsWith('/')) return p.replace(/\/$/, '') || '/';
    if (p === '..') {
      const parts = cwd.split('/').filter(Boolean);
      parts.pop();
      return '/' + parts.join('/') || '/';
    }
    if (p === '.') return cwd;
    const base = cwd === '/' ? '' : cwd;
    return (base + '/' + p).replace(/\/$/, '') || '/';
  };

  const listDir = (path: string): string[] => {
    const node = virtualFS[path];
    if (node?.type === 'dir') return node.children || [];
    const parent = path.substring(0, path.lastIndexOf('/')) || '/';
    const pNode = virtualFS[parent];
    return pNode?.children || [];
  };

  const getPrompt = () => {
    const dir = cwd === '/' ? '~' : '~' + cwd;
    return `guest@antigravity:${dir}$`;
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const [cmd, ...args] = input.trim().split(' ');
    let output = '';

    if (cmd === 'clear') {
      setHistory([]);
      setCwd('/');
      setInput('');
      return;
    }

    switch (cmd) {
      case 'help':
        output = 'Available commands: help, ls, cd <dir>, cat <file>, pwd, clear, whoami, version, status';
        break;

      case 'ls': {
        const target = args[0] ? resolvePath(args[0]) : cwd;
        const children = listDir(target);
        if (children.length === 0) {
          output = `ls: ${target}: No such directory`;
        } else {
          output = children.join('  ');
        }
        break;
      }

      case 'cd': {
        const target = args[0] || '/';
        const resolved = resolvePath(target);
        const node = virtualFS[resolved];
        if (!node || node.type !== 'dir') {
          output = `cd: ${target}: No such directory`;
        } else {
          setCwd(resolved);
        }
        break;
      }

      case 'pwd':
        output = cwd === '/' ? '/' : cwd;
        break;

      case 'cat': {
        const file = args[0];
        if (!file) {
          output = 'cat: missing operand';
          break;
        }
        const resolved = file.startsWith('/') ? file : (cwd === '/' ? '/' + file : cwd + '/' + file);
        const node = virtualFS[resolved];
        if (!node || node.type !== 'file') {
          output = `cat: ${file}: No such file or directory`;
        } else {
          output = node.content || '';
        }
        break;
      }

      case 'whoami':
        output = 'Lead Full Stack Developer | DSA Enthusiast | AI Integrator';
        break;

      case 'version':
        output = 'DevOS v2.4.0-stable (build 2026-05-11)';
        break;

      case 'status':
        output = 'System: Online\nUptime: 1,440 hours\nCPU: 4.2GHz\nRAM: 64GB';
        break;

      default:
        output = `Command not found: ${cmd}. Type "help" for assistance.`;
    }

    if (output) {
      setHistory([...history, `${getPrompt()} ${input}`, output]);
    } else {
      setHistory([...history, `${getPrompt()} ${input}`]);
    }
    setInput('');
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="bg-[#0f172a] rounded-xl overflow-hidden border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        >
          {/* Terminal Header */}
          <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="ml-4 flex items-center gap-2 text-slate-400 text-xs font-mono">
                <TerminalIcon size={14} />
                <span>bash — dev@portfolio — 80x24</span>
              </div>
            </div>
          </div>

          {/* Terminal Body */}
          <div 
            ref={scrollRef}
            className="h-[400px] p-6 font-mono text-sm overflow-y-auto bg-slate-950/50 backdrop-blur-sm"
            onClick={() => inputRef.current?.focus()}
          >
            {history.map((line, i) => (
              <div key={i} className={`mb-1 whitespace-pre-wrap ${line.includes('$') ? 'text-purple-400' : 'text-slate-300'}`}>
                {line}
              </div>
            ))}
            <form onSubmit={handleCommand} className="flex mt-2">
              <span className="text-green-500 mr-2">{getPrompt()}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-200"
                autoFocus
                spellCheck={false}
              />
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Terminal;
