import assert from "node:assert/strict";
import test from "node:test";
import {
	createLibraryStore,
	readLibrary,
	sessionEntry,
} from "../src/services/storage.mjs";

const game = { identifier: "a", title: "A" };
const other = { identifier: "b", title: "B", elapsedSeconds: 17 };
function fixture(write = async () => {}) {
	let disk = { saved: [game, other], last: other };
	const store = createLibraryStore(
		async (state) => {
			await write();
			disk = state;
		},
		() => {},
	);
	const reopen = () => store.restore(async () => disk);
	return { store, reopen, read: () => disk };
}
test("two removes before the first write finishes persist across restore", async () => {
	let finish;
	const gate = new Promise((resolve) => {
		finish = resolve;
	});
	const { store, reopen, read } = fixture(() => gate);
	await reopen();
	const first = store.remove(game);
	const second = store.remove(game);
	await Promise.resolve();
	assert.equal(read().saved.length, 2);
	finish();
	await Promise.all([first, second]);
	await reopen();
	assert.deepEqual(read().saved, [other]);
});
test("session save can retry a failed write and refresh a favorite without losing legacy fields", async () => {
	let failing = true;
	const { store, reopen, read } = fixture(async () => {
		if (failing) throw Error("storage full");
	});
	await reopen();
	const entry = sessionEntry(game, 1000, 6100);
	await assert.rejects(store.saveSession(entry));
	assert.deepEqual(read(), { saved: [game, other], last: other });
	failing = false;
	await store.saveSession(entry);
	await store.saveSession(sessionEntry(game, 1000, 8300));
	assert.equal(read().saved.length, 2);
	assert.equal(read().saved[0].elapsedSeconds, 7);
	assert.deepEqual(read().last, read().saved[0]);
	assert.deepEqual(read().saved[1], other);
});

test("old favorites and session remain available on upgrade and reload", async () => {
	for (const key of ["@arcadia/favorites", "@blastback/saves"]) {
		const disk = new Map([
			[key, JSON.stringify([other])],
			["@blastback/last-session", JSON.stringify(other)],
		]);
		const read = () => readLibrary(async (name) => disk.get(name) ?? null);
		const store = createLibraryStore(
			async (state) => disk.set("@blastback/library-v1", JSON.stringify(state)),
			() => {},
		);
		await store.restore(read);
		assert.deepEqual(await read(), { saved: [other], last: other });
		await store.add(game);
		await store.remove(game);
		await store.remove(game);
		assert.deepEqual(await read(), { saved: [other], last: other });
	}
});
