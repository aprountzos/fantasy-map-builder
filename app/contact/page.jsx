'use client'
import { MailIcon, LinkIcon } from '@heroicons/react/24/outline'

export default function Contact() {
  const contacts = [
    { name: 'Email', url: 'mailto:thanasisp20@gmail.com', icon: '📧' },
    { name: 'Instagram', url: 'https://www.instagram.com/thanasis.prountzos/', icon: '📸' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/athanasios-prountzos-582b99264', icon: '💼' },
    { name: 'GitHub', url: 'https://github.com/aprountzos', icon: '🐙' },
  ]

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white overflow-hidden p-6">
      {/* Background floating circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-700 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-700 rounded-full opacity-20 animate-pulse"></div>

      <div className="z-10 text-center max-w-3xl w-full space-y-6">
        <h1 className="text-5xl sm:text-6xl font-extrabold drop-shadow-xl text-indigo-300">
          📬 Connect with Us
        </h1>
        <p className="text-lg sm:text-xl text-gray-300">
          Reach out to Fantasy Map Builder via your preferred platform:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {contacts.map((c, i) => (
            <a
              key={i}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-black/50 backdrop-blur-md shadow-lg hover:scale-105 transition-transform text-white font-semibold"
            >
              <span className="text-2xl">{c.icon}</span>
              <span>{c.name}</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}
