export const SAVED_KEY = "@arcadia/favorites";
export const LAST_KEY = "@blastback/last-session";
export function parseGames(raw) {
	try {
		const data = JSON.parse(raw || "[]");
		return Array.isArray(data)
			? [
					...new Map(
						data
							.filter(
								(g) =>
									typeof g?.identifier === "string" &&
									typeof g?.title === "string",
							)
							.map((g) => [g.identifier, g]),
					).values(),
				]
			: [];
	} catch {
		return [];
	}
}
export function parseSession(raw) {
	return parseGames(`[${raw || "null"}]`)[0] || null;
}

export const LIBRARY_KEY = "@blastback/library-v1";

export async function readLibrary(read) {
	const raw = await read(LIBRARY_KEY);
	if (raw !== null) {
		const data = JSON.parse(raw);
		if (!Array.isArray(data?.saved)) throw Error("Biblioteca inválida");
		return data;
	}
	const saved = (await read(SAVED_KEY)) ?? (await read("@blastback/saves"));
	return { saved: parseGames(saved), last: parseSession(await read(LAST_KEY)) };
}

export function sessionEntry(game, startedAt, now = Date.now()) {
	return {
		...game,
		savedAt: new Date(now).toISOString(),
		elapsedSeconds: Math.max(0, Math.floor((now - startedAt) / 1000)),
	};
}

// Favorites and the last session share one write and one confirmation.
export function createLibraryStore(write, publish) {
	let confirmed;
	let pending = Promise.resolve();
	function enqueue(task) {
		const result = pending.then(task);
		pending = result.catch(() => {});
		return result;
	}
	function update(change) {
		return enqueue(async () => {
			if (!confirmed) throw Error("Biblioteca indisponível");
			const next = change(confirmed);
			if (next === confirmed) return;
			await write(next);
			confirmed = next;
			publish(next);
		});
	}
	return {
		restore: (read) =>
			enqueue(async () => {
				confirmed = await read();
				publish(confirmed);
			}),
		add: (game) =>
			update((state) =>
				state.saved.some((item) => item.identifier === game.identifier)
					? state
					: {
							...state,
							saved: [
								{ ...game, savedAt: new Date().toISOString() },
								...state.saved,
							],
						},
			),
		remove: (game) =>
			update((state) => {
				const saved = state.saved.filter(
					(item) => item.identifier !== game.identifier,
				);
				return saved.length === state.saved.length
					? state
					: { ...state, saved };
			}),
		remember: (last) => update((state) => ({ ...state, last })),
		saveSession: (entry) =>
			update((state) => {
				const previous = state.saved.find(
					(item) => item.identifier === entry.identifier,
				);
				const last = { ...previous, ...entry };
				return {
					saved: [
						last,
						...state.saved.filter(
							(item) => item.identifier !== entry.identifier,
						),
					],
					last,
				};
			}),
	};
}
