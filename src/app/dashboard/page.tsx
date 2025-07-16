'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { withAuth } from '../../../lib/withAuth'
import styles from './dashboard.module.css'
import { useRouter } from 'next/navigation'





function Dashboard() {
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
    router.push('/') 
  }
}


  const fetchNotes = async (uid: string) => {
    const { data, error } = await supabase
      .from('Notes')
      .select('*')
      .eq('user_id', uid)
      .order('pinned_notes', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notes:', error)
    } else {
      setNotes(data || [])
    }
  }

  const [colour,setColour] = useState('')
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
      colour,
    })

    if (error) {
      console.error('Insert Error:', error)
      setMessage(error.message)
    } else {

      setTitle('')
      setContent('')
      fetchNotes(userId!)
      setColour('')
    }
  }


const handleTogglePin = async (noteId: number, currentStatus: boolean) => {
  const { error } = await supabase
    .from('Notes')
    .update({ pinned_notes: !currentStatus })
    .eq('id', noteId)

  if (error) {
    console.error('Error pinning/unpinning:', error)
    setMessage('Failed to pin/unpin the note.')
  } else {
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
      <div className={styles.colourPicker}>
  <label>Select Color Label:</label>
  <select value={colour} onChange={(e) => setColour(e.target.value)} className={styles.select}>
    <option value="gray">Gray</option>
    <option value="red">Red</option>
    <option value="blue">Blue</option>
    <option value="green">Green</option>
    <option value="yellow">Yellow</option>
    <option value="purple">Purple</option>
  </select>
</div>

      <button onClick={handleCreateNote} className={styles.button}>
        Create Note
      </button>

      {message && <p className={styles.message}>{message}</p>}

      <hr />
      

      {notes.length === 0 ? (
  <p>No notes yet.</p>
) : (
  <>
    {/* 📌 Pinned Notes Section */}
    {notes.some(note => note.pinned_notes) && (
      <>
        <h2>Pinned Notes</h2>
        <ul className={styles.noteList}>
          {notes.filter(note => note.pinned_notes).map((note) => (
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
                    <button onClick={handleUpdateNote} className={styles.button}>Save</button>
                    <button onClick={() => setEditingNoteId(null)} className={styles.button}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div className={styles.noteHeader}>
                      <h3>{note.title}</h3>
                      <div className={styles.actions}>
                        <span
                          className={styles.icon}
                          onClick={() => handleTogglePin(note.id, note.pinned_notes)}
                          title="Unpin"
                        >
                          📌
                        </span>
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
                          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 30 30">
    <path d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"></path>
</svg>
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
      </>
    )}

    {/* 📝 Other Notes Section */}
    {notes.some(note => !note.pinned_notes) && (
      <>
        <h2>Your Notes</h2>
        <ul className={styles.noteList}>
          {notes.filter(note => !note.pinned_notes).map((note) => (
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
                    <button onClick={handleUpdateNote} className={styles.button}>Save</button>
                    <button onClick={() => setEditingNoteId(null)} className={styles.button}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div className={styles.noteHeader}>
                      <h3>{note.title}</h3>
                      <div className={styles.actions}>
                        <span
                          className={styles.icon}
                          onClick={() => handleTogglePin(note.id, note.pinned_notes)}
                          title="Pin"
                        >
                          📌
                        </span>
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
      </>
    )}
  </>
)}
    </div>
  )
}

export default withAuth(Dashboard)
