export class DatabaseManager<T> {
	private dbName: string;
	private storeName: string;
	private db: IDBDatabase | null = null;

	constructor(dbName: string, storeName: string) {
		this.dbName = dbName;
		this.storeName = storeName;
	}

	async init(version: number = 1): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, version);

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				if (!db.objectStoreNames.contains(this.storeName)) {
					db.createObjectStore(this.storeName, {
						keyPath: 'id',
					}).createIndex('title', 'title', { unique: false });
				}
			};

			request.onsuccess = (event) => {
				this.db = (event.target as IDBOpenDBRequest).result;
				resolve();
			};

			request.onerror = (event) => {
				reject((event.target as IDBOpenDBRequest).error);
			};
		});
	}

	async getAll(): Promise<T[]> {
		return new Promise((resolve, reject) => {
			if (!this.db) {
				return reject(new Error('Database not initialized'));
			}

			const transaction = this.db.transaction(this.storeName, 'readonly');
			const store = transaction.objectStore(this.storeName);
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result as T[]);
			request.onerror = (event) =>
				reject((event.target as IDBRequest).error);
		});
	}

	async getByTitle(title: string): Promise<T | undefined> {
		return new Promise((resolve, reject) => {
			if (!this.db) {
				return reject(new Error('Database not initialized'));
			}

			const transaction = this.db.transaction(this.storeName, 'readonly');
			const store = transaction.objectStore(this.storeName);
			const index = store.index('title');
			const request = index.get(title);

			request.onsuccess = () => resolve(request.result as T | undefined);
			request.onerror = (event) =>
				reject((event.target as IDBRequest).error);
		});
	}

	async delete(id: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.db) {
				return reject(new Error('Database not initialized'));
			}

			const transaction = this.db.transaction(
				this.storeName,
				'readwrite'
			);
			const store = transaction.objectStore(this.storeName);
			const request = store.delete(id);

			request.onsuccess = () => resolve();
			request.onerror = (event) =>
				reject((event.target as IDBRequest).error);
		});
	}

	async update(data: T): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!this.db) {
				return reject(new Error('Database not initialized'));
			}

			const transaction = this.db.transaction(
				this.storeName,
				'readwrite'
			);
			const store = transaction.objectStore(this.storeName);
			const request = store.put(data);

			request.onsuccess = () => resolve();
			request.onerror = (event) =>
				reject((event.target as IDBRequest).error);
		});
	}

	async add(data: T): Promise<number> {
		return new Promise((resolve, reject) => {
			if (!this.db) {
				return reject(new Error('Database not initialized'));
			}

			const transaction = this.db.transaction(
				this.storeName,
				'readwrite'
			);
			const store = transaction.objectStore(this.storeName);
			const request = store.add(data);

			request.onsuccess = () => resolve(request.result as number);
			request.onerror = (event) =>
				reject((event.target as IDBRequest).error);
		});
	}
}
