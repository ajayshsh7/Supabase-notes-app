'use client'
import styles from "./page.module.css"
import Link from 'next/link'

const demoNotes = [
  {
    id: 1,
    title: "👋 Welcome to My Notes App",
    content: "This app helps you save private notes. Only you can access them after logging in.",
  },
  {
    id: 2,
    title: "📌 How to Use",
    content: "Just log in, create a note with a title and content, and it will be saved securely under your account.",
  },
  {
    id: 3,
    title: "🔐 Why It’s Safe",
    content: "Your notes are protected with Supabase Auth + Row-Level Security. No one else can see them.",
  },
  {
    id: 4,
    title: "🎯 About Me",
    content: "Hi, I’m Ajay I built this app to simplify note-taking. Feel free to explore!",
  }
]

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>My Notes App</h1>
        <div className={styles.actions}>
          <Link href="/auth" className={styles.link}>Login</Link>
        </div>
      </header>

      <section className={styles.notesSection}>
        <h2>📝 Try the Demo</h2>
        <p>Here's a preview of what your notes could look like:</p>

        <ul className={styles.noteList}>
          {demoNotes.map(note => (
            <li key={note.id} className={styles.noteItem}>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
