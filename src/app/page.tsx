'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { withAuth } from '../../lib/withAuth'
import styles from './page.module.css'

function Home() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [notes, setNotes] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        fetchNotes(user.id)
      }
    }

    fetchUserAndNotes()
  }, [])

  const fetchNotes = async (uid: string) => {
    const { data, error } = await supabase
      .from('Notes')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
    } else {
      setNotes(data || [])
    }
  }

  const handleCreateNote = async () => {
    if (!title.trim() || !content.trim()) {
      setMessage('Both title and content are required.')
      return
    }

    const { error } = await supabase.from('Notes').insert({
      title,
      content,
      user_id: userId,
    })

    if (error) {
      console.error('Insert Error:', error)
      setMessage(error.message)
    } else {
      setMessage('Note created successfully!')
      setTitle('')
      setContent('')
      fetchNotes(userId!) // 👈 refetch after insert
    }
  }

  return (
    <div className={styles.container}>
      <h1>Create a New Note</h1>

      <input
        type="text"
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.input}
      />

      <textarea
        placeholder="Note Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className={styles.textarea}
      />

      <button onClick={handleCreateNote} className={styles.button}>
        Create Note
      </button>

      {message && <p className={styles.message}>{message}</p>}

      <hr />

      <h2>Your Notes</h2>
      {notes.length === 0 ? (
        <p>No notes yet.</p>
      ) : (
        <ul className={styles.noteList}>
          {notes.map((note) => (
            <li key={note.id} className={styles.noteItem}>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default withAuth(Home)
