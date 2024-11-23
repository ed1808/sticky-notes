import { DatabaseManager } from '../database/db';

export type Note = {
	id: string;
	title: string;
	content: string;
    posX: number;
    posY: number;
};

export class NoteComponent {
	private noteId: string;
    private noteTitle?: string;
    private noteContent?: string;
    private isDragging: boolean = false;
    private dragX: number = 0;
    private dragY: number = 0;
    private posX: number;
    private posY: number;
	private db: DatabaseManager<Note>;

	constructor(manager: DatabaseManager<Note>, noteId: string, posX: number, posY: number, title?: string, content?: string) {
		this.noteId = noteId;
        this.noteTitle = title;
        this.noteContent = content;
        this.posX = posX;
        this.posY = posY;
		this.db = manager;
	}

	private generateNoteHeader(titleText?: string): HTMLDivElement {
		const noteHeader = document.createElement('div');

		const noteTitleInput = document.createElement('input');
		const noteTitle = document.createElement('h2');
        
        const noteActions = document.createElement('div');
        const noteActionDelete = document.createElement('button');
        
        const noteTitleContainer = document.createElement('div');

        noteActionDelete.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
                <path d="M19.0005 4.99988L5.00049 18.9999M5.00049 4.99988L19.0005 18.9999" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        `;

		noteTitleInput.type = 'text';
		noteTitleInput.placeholder = 'Title';
		noteTitleInput.value = titleText ?? '';
		noteTitleInput.classList.add('hidden');

		noteTitle.textContent = titleText ?? 'Title';
        noteTitle.title = titleText ?? 'Title';
		noteTitle.addEventListener('dblclick', function () {
			noteTitleInput.classList.remove('hidden');
			noteTitleInput.focus();

			this.classList.add('hidden');
		});

		noteTitleInput.addEventListener('blur', function () {
			const prevValue = noteTitle.textContent;

			this.classList.add('hidden');

			if (this.value.trim() === '') {
				noteTitle.textContent = prevValue;
				noteTitle.title = prevValue ?? '';
			} else {
				noteTitle.textContent = this.value;
				noteTitle.title = this.value;
			}

			noteTitle.classList.remove('hidden');
		});

        noteActionDelete.addEventListener('click', async () => {
            await this.db.delete(this.noteId);
            document.querySelector(`#note-${this.noteId}`)!.remove();
        });

        noteTitleContainer.className = 'note-title-container';
        noteActions.className = 'note-actions';
		noteHeader.className = 'note-header';

        noteTitleContainer.append(noteTitleInput, noteTitle);
        noteActions.append(noteActionDelete);
		noteHeader.append(noteTitleContainer, noteActions);

		return noteHeader;
	}

	private generateNoteContent(contentText?: string): HTMLDivElement {
		const noteContent = document.createElement('div');

		noteContent.className = 'note-content';
		noteContent.addEventListener('dblclick', function () {
			this.contentEditable = 'true';
			this.style.padding = '0.5rem';
		});

		noteContent.addEventListener('blur', async () => {
			noteContent.contentEditable = 'false';
			noteContent.style.padding = '0';

			this.db.update({
				id: this.noteId,
				title:
					document.querySelector(`#note-${this.noteId} h2`)!
						.textContent ?? '',
				content: noteContent.innerText,
                posX: this.posX,
                posY: this.posY
			});
		});

        noteContent.textContent = contentText ?? '';

		return noteContent;
	}

	create(): HTMLDivElement {
		const note = document.createElement('div');
		note.id = `note-${this.noteId}`;

		note.className = 'note';
        note.style.left = `${this.posX}px`;
        note.style.top = `${this.posY}px`;

		const noteHeader = this.generateNoteHeader(this.noteTitle);
		const noteContent = this.generateNoteContent(this.noteContent);

        note.addEventListener('mousedown', (e: MouseEvent) => {
            console.log(e);
            this.isDragging = true;
            this.dragX = e.clientX - note.offsetLeft;
            this.dragY = e.clientY - note.offsetTop;
        });

        note.addEventListener('mousemove', (e: MouseEvent) => {
            e.preventDefault();
            if (this.isDragging) {
                note.style.left = `${e.clientX - this.dragX}px`;
                note.style.top = `${e.clientY - this.dragY}px`;
            }
        });

        note.addEventListener('mouseup', async () => {
            this.isDragging = false;

            const title = noteHeader.querySelector('h2')!.textContent!;
            const content = noteContent.textContent!;
            
            const posX = Number(note.style.left.replace('px', ''));
            const posY = Number(note.style.top.replace('px', ''));

            await this.db.update({
                id: this.noteId,
                title,
                content,
                posX,
                posY
            });
        });

		note.append(noteHeader, noteContent);

		return note;
	}
}
