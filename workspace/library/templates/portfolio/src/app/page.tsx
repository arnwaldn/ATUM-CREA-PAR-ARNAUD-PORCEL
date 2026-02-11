'use client'

import { useState } from 'react'
import {
  Github, Linkedin, Twitter, Mail, ExternalLink, Code,
  Briefcase, User, FileText, ChevronRight, Menu, X, Moon, Sun
} from 'lucide-react'
import { cn, type Project, type Skill, type Experience } from '@/lib/utils'

const projects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Platform',
    description: 'Plateforme e-commerce complète avec paiement Stripe, gestion des stocks et analytics',
    tags: ['Next.js', 'Prisma', 'Stripe', 'TailwindCSS'],
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=600',
    github: 'https://github.com',
    demo: 'https://demo.com',
    featured: true,
  },
  {
    id: '2',
    title: 'AI Dashboard',
    description: 'Dashboard d\'analyse avec intégration OpenAI pour insights automatiques',
    tags: ['React', 'OpenAI', 'Recharts', 'TypeScript'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600',
    github: 'https://github.com',
    featured: true,
  },
  {
    id: '3',
    title: 'Mobile Banking App',
    description: 'Application mobile de gestion financière avec React Native',
    tags: ['React Native', 'Expo', 'Supabase'],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600',
    demo: 'https://demo.com',
    featured: true,
  },
  {
    id: '4',
    title: 'Real-time Chat',
    description: 'Application de chat en temps réel avec WebSocket',
    tags: ['Node.js', 'Socket.io', 'React', 'MongoDB'],
    image: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=600',
    github: 'https://github.com',
    featured: false,
  },
]

const skills: Skill[] = [
  { name: 'React/Next.js', level: 95, category: 'frontend' },
  { name: 'TypeScript', level: 90, category: 'frontend' },
  { name: 'TailwindCSS', level: 95, category: 'frontend' },
  { name: 'Node.js', level: 85, category: 'backend' },
  { name: 'Python', level: 80, category: 'backend' },
  { name: 'PostgreSQL', level: 85, category: 'backend' },
  { name: 'Git', level: 90, category: 'tools' },
  { name: 'Docker', level: 75, category: 'tools' },
  { name: 'Figma', level: 80, category: 'design' },
]

const experiences: Experience[] = [
  {
    company: 'Tech Startup',
    role: 'Lead Developer',
    period: '2023 - Présent',
    description: 'Direction technique d\'une équipe de 5 développeurs. Architecture et développement de la plateforme SaaS principale.',
    current: true,
  },
  {
    company: 'Digital Agency',
    role: 'Full-Stack Developer',
    period: '2021 - 2023',
    description: 'Développement de sites web et applications pour des clients variés. Spécialisation React et Node.js.',
  },
  {
    company: 'Freelance',
    role: 'Web Developer',
    period: '2019 - 2021',
    description: 'Création de sites web sur mesure pour PME et startups. Focus sur la performance et l\'accessibilité.',
  },
]

export default function Portfolio() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [activeSection, setActiveSection] = useState('about')

  const featuredProjects = projects.filter(p => p.featured)

  return (
    <div className={cn('min-h-screen', darkMode && 'dark')}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Navigation */}
        <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {'<JD />'}
              </span>

              <div className="hidden md:flex items-center gap-8">
                {['about', 'projects', 'skills', 'experience', 'contact'].map((section) => (
                  <a
                    key={section}
                    href={`#${section}`}
                    onClick={() => setActiveSection(section)}
                    className={cn(
                      'text-sm capitalize transition-colors',
                      activeSection === section
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    {section === 'about' ? 'À propos' : section === 'experience' ? 'Expérience' : section}
                  </a>
                ))}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section id="about" className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <p className="text-blue-600 font-mono text-sm mb-4">Bonjour, je suis</p>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Jean Dupont
              </h1>
              <h2 className="text-3xl md:text-4xl text-gray-600 dark:text-gray-400 mb-8">
                Full-Stack Developer
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                Je crée des applications web modernes et performantes. Passionné par le code propre,
                l'UX et les nouvelles technologies. Actuellement Lead Developer chez Tech Startup.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Me contacter
                </a>
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Voir mes projets
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>

              <div className="flex items-center gap-4">
                <a href="https://github.com" className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="https://linkedin.com" className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="https://twitter.com" className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <Code className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold">Projets</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      {project.github && (
                        <a href={project.github} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {project.demo && (
                        <a href={project.demo} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills */}
        <section id="skills" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <User className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold">Compétences</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {skills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-gray-600 dark:text-gray-400">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <Briefcase className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold">Expérience</h2>
            </div>

            <div className="space-y-8">
              {experiences.map((exp, i) => (
                <div
                  key={exp.company}
                  className="relative pl-8 border-l-2 border-gray-200 dark:border-gray-700"
                >
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full" />
                  <div className="flex flex-wrap items-center gap-4 mb-2">
                    <h3 className="text-xl font-semibold">{exp.role}</h3>
                    {exp.current && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
                        Actuel
                      </span>
                    )}
                  </div>
                  <p className="text-blue-600 font-medium mb-2">{exp.company}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{exp.period}</p>
                  <p className="text-gray-600 dark:text-gray-400">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <FileText className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold">Me contacter</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Vous avez un projet en tête ? N'hésitez pas à me contacter !
            </p>
            <a
              href="mailto:jean@exemple.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5" />
              jean@exemple.com
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            © {new Date().getFullYear()} Jean Dupont. Créé avec Next.js & TailwindCSS.
          </p>
        </footer>
      </div>
    </div>
  )
}
