'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { withAuth } from '../../../lib/withAuth'
import styles from './dashboard.module.css'
import { useRouter } from 'next/navigation'





function Home() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [notes, setNotes] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')


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
const router = useRouter()
  const handleLogout = async () => {
    
  const { error } = await supabase.auth.signOut()
  if (!error) {
    setUserId(null)
    setNotes([])
    router.push('/home') 
  }
}


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
// handling max notes limits
    const MAX_NOTES = 50


    if (notes.length >= MAX_NOTES) {
    setMessage(`You’ve reached the maximum limit of ${MAX_NOTES} notes.`)
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

      setTitle('')
      setContent('')
      fetchNotes(userId!)
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    const { error } = await supabase.from('Notes').delete().eq('id', noteId)

    if (error) {
      console.error('Delete Error:', error)
      setMessage('Failed to delete note.')
    } else {
      fetchNotes(userId!)
    }
  }
  const handleEditNote = (note: any) => {
    setEditingNoteId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }
  const handleUpdateNote = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      setMessage('Both fields are required.')
      return
    }

    const { error } = await supabase
      .from('Notes')
      .update({
        title: editTitle,
        content: editContent,
      })
      .eq('id', editingNoteId)

    if (error) {
      console.error('Update error:', error)
      setMessage('Error updating note.')
    } else {
      setEditingNoteId(null)
      setEditTitle('')
      setEditContent('')
      fetchNotes(userId!)
    }
  }

  return (
    <div className={styles.container}>
    <div className={styles.topBar}>
  <h2 className={styles.logo}>Notes App</h2>
  {userId ? (
    <button className={styles.profileButton} onClick={handleLogout}>
      Logout
    </button>
  ) : (
    <a href="/login" className={styles.profileButton}>
      Login
    </a>
  )}
</div>

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
              <div className={styles.noteHeader}>

                {editingNoteId === note.id ? (
                  <>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={styles.input}
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className={styles.textarea}
                    />
                    <button onClick={handleUpdateNote} className={styles.button}>
                      Save
                    </button>
                    <button onClick={() => setEditingNoteId(null)} className={styles.button}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.noteHeader}>
                      <h3>{note.title}</h3>
                      <div className={styles.actions}>
                        <span
                          className={styles.icon}
                          onClick={() => handleEditNote(note)}
                          title="Edit"
                        >
                          ✏️
                        </span>
                        <span
                          className={styles.icon}
                          onClick={() => handleDeleteNote(note.id)}
                          title="Delete"
                        >
                          🗑️
                        </span>
                      </div>
                    </div>
                    <p>{note.content}</p>
                  </>
                )}

              </div>

            </li>
          ))}

        </ul>
      )}
    </div>
  )
}

export default withAuth(Home)
