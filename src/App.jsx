import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { onSnapshot, doc, addDoc, setDoc, deleteDoc } from "firebase/firestore"
import { notesCollection, db } from "./firebase"


function App() {
    /** 
     * When the app first loads, initialize the notes state
     * with the notes saved in localStorage. You'll need to
     * use JSON.parse() to turn the stringified array back
     * into a real JS array. 
     * 
     * Lazily initialize our `notes` state so it doesn't
     * reach into localStorage on every single re-render
     * of the App component
     */
    // const [notes, setNotes] = React.useState(
    //     () => JSON.parse(localStorage.getItem("notes")) || []
    // )

    // no more local storage now we will use firestore db
    const [notes, setNotes] = React.useState([])
    const [currentNoteId, setCurrentNoteId] = React.useState("")

    const currentNote = notes.find(note => note.id === currentNoteId) || notes[0]

    // Try to rearrange the most recently-modified note at the top
    const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt)

    /** 
     * to implemenet debouncing logic we will make use of a new state tempNoteText
     * tempNoteText will be holding the most up to date text and update on every
     * key stroke. This way the Editor will use `tempNoteText` and `setTempNoteText`
     * for displaying and changing the text instead of dealing directly with the
     * `currentNote` data that might not be the most up-date
     * */ 
    const [tempNoteText, setTempNoteText] = React.useState("")
    
    /**
     * Every time the `notes` array changes (hint: trigger of change indicates useEffect, save it in localStorage.
     * You'll need to use JSON.stringify() to turn the array into a string to save in localStorage.
     * useEffect because localStorage is a side effects which React can't handle
     */
    // originally used localStorage to mimic a db to read and write
    // React.useEffect(() => {
    //     localStorage.setItem("notes", JSON.stringify(notes))
    // }, [notes])

    // new functionality to allow use of firestore db
    // no dependencies and we only want to setup our onSnapshot listener once
    React.useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, (snapshot) => {
            // Sync up our local notes array with the snapshot data
            const notesArr = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            }))
            setNotes(notesArr)
        })
        // cleanup
        return unsubscribe
    }, [])

    React.useEffect(() => {
        if (!currentNoteId) {
            setCurrentNoteId(notes[0]?.id)
        }
    }, [notes])

    /** 
     *  whenever the user changes the currentNote, the editor can display the 
     *  correct text. This copies the current note's text into the `tempNoteText
     */ 
    React.useEffect(() => {
        if(currentNote) setTempNoteText(currentNote.body)
    }, [currentNote])

    /**
     * Debouncer effect that will run any time the tempNoteText changes
     * Delay the sending of the request to Firebase using setTimeout
     * Uses clearTimeout to cancel the timeout (cleanup)
     */
    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (tempNoteText !== currentNote.body) updateNote(tempNoteText)
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [tempNoteText])
    
    // old functionality
    // function createNewNote() {
    //     const newNote = {
    //         id: nanoid(),
    //         body: "# Type your markdown note's title here",
    //     };
    //     setNotes((prevNotes) => [newNote, ...prevNotes]);
    //     setCurrentNoteId(newNote.id);
    // }

    // new functionality with firestore db
    async function createNewNote() {
        const newNote = {
            body: "# Type your markdown note's title here",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        const newNoteRef = await addDoc(notesCollection, newNote)
        setCurrentNoteId(newNoteRef.id)
    }
    
    // new functionality with firestore db
    async function updateNote(text) {
        const docRef = doc(db, "notes", currentNoteId)
        await setDoc(docRef, { body: text, updatedAt: Date.now() }, { merge: true })
    }

    // old functionality
    // function updateNote(text) {
    //     setNotes(oldNotes => {
    //         const newNotes = [];
    //         for(let i = 0; i < oldNotes.length; i++) {
    //             const oldNote = oldNotes[i]
    //             if (oldNote.id === currentNoteId) {
    //                 // add modified note to beginning of array
    //                 newNotes.unshift({ ...oldNote, body: text })
    //             } else {
    //                 // add other notes to the end of array
    //                 newNotes.push(oldNote)
    //             }
    //         }
    //         return newNotes
    //     })
    // }

    // old functionality
    // function deleteNote(event, noteId) {
    //     event.stopPropagation()
    //     setNotes(oldNotes => oldNotes.filter(oldNote => oldNote.id !== noteId))
    // }

    // new functionality with firestore db
    async function deleteNote(noteId) {
        const docRef = doc(db, "notes", noteId)
        await deleteDoc(docRef)
    }
    
    // instead of calling function twice by sidebar and editor
    // we are now just initializing a variable to hold current note
    // function findCurrentNote() {
    //     return notes.find(note => {
    //         return note.id === currentNoteId
    //     }) || notes[0]
    // }
    
    return (
        <main>
        {
            notes.length > 0 
            ?
            <Split 
                sizes={[30, 70]} 
                direction="horizontal" 
                className="split"
            >
                <Sidebar
                    notes={sortedNotes}
                    currentNote={currentNote}
                    setCurrentNoteId={setCurrentNoteId}
                    newNote={createNewNote}
                    deleteNote={deleteNote}
                />
                <Editor 
                    tempNoteText={tempNoteText} 
                    setTempNoteText={setTempNoteText} 
                />
            </Split>
            :
            <div className="no-notes">
                <h1>You have no notes</h1>
                <button 
                    className="first-note" 
                    onClick={createNewNote}
                >
                    Create one now
                </button>
            </div>
            
        }
        </main>
    )
}

export default App