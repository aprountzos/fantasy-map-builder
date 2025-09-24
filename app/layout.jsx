import './globals.css'
import Navbar from '../components/Navbar'
import EditorInstructionsWidget from '../components/EditorInstructionsWidget'

export const metadata = {
  title: 'Fantasy Map Builder',
  description: 'Map editor + viewer',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen flex flex-col">
        <Navbar className="sticky top-0 z-50 backdrop-blur-md bg-gray-900/70 shadow-lg" />
        <main className="flex-1 p-6">{children}</main>
        <EditorInstructionsWidget />
        <footer className="text-center text-gray-400 py-4 text-sm">
          &copy; {new Date().getFullYear()} Fantasy Map Builder. All rights reserved.
        </footer>
      </body>
    </html>
  )
}
