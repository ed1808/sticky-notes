import { DatabaseManager } from './database/db';
import { NoteComponent, type Note } from './components/note';

let db: DatabaseManager<Note>;
let notesBoard: HTMLDivElement;
let notes: Note[] = [];

document.addEventListener('DOMContentLoaded', async () => {
	db = new DatabaseManager<Note>('NotesDB', 'notes');
	notesBoard = document.querySelector('.notes-board')!;

	await db.init();

	notes = await db.getAll();

	notes.forEach((note) => {
		const { id, title, content, posX, posY } = note;
		const noteComponent = new NoteComponent(db, id, posX, posY, title, content);
		document
			.querySelector('.notes-board')!
			.appendChild(noteComponent.create());
	});

	document
		.querySelector<HTMLInputElement>('#search-note')!
		.addEventListener('keyup', async function () {
			const title = this.value;
			await searchNote(title);
		});

	document
		.querySelector<HTMLButtonElement>('.add-note')!
		.addEventListener('click', addNote);
});

const addNote = async (): Promise<void> => {
	const noteId = crypto.randomUUID();
    const posX = Math.floor(Math.random() * (window.innerWidth - 300));
    const posY = Math.floor(Math.random() * (window.innerHeight - 300));
	
    const note = new NoteComponent(db, noteId, posX, posY);

	notesBoard.appendChild(note.create());

	await db.add({
		id: noteId,
		title: '',
		content: '',
        posX,
        posY
	});
};

const searchNote = async (title: string): Promise<void> => {
    notesBoard.innerHTML = '';

	if (!title) {
		notes.forEach((note) => {
			const { id, title, content, posX, posY } = note;
			const noteComponent = new NoteComponent(db, id, posX, posY, title, content);
			notesBoard.appendChild(noteComponent.create());
		});

		return;
	}

	const note = await db.getByTitle(title);

	if (note) {
		const { id, title, posX, posY, content } = note;
        console.log(content);
		const noteComponent = new NoteComponent(db, id, posX, posY, title, content);
		notesBoard.appendChild(noteComponent.create());
	}
};
