import { API, SYSTEMS } from "../constants/catalog";
import { detectEmulator } from "./emulatorService.mjs";
const clean = (value) =>
	String(value || "")
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();

export async function searchGames({
	collection,
	query,
	sort = "downloads desc",
	rows = 36,
} = {}) {
	const collections = collection
		? `collection:${collection}`
		: `(${SYSTEMS.map((s) => `collection:${s.id}`).join(" OR ")})`;
	const terms = [collections, "mediatype:software"];
	if (query?.trim())
		terms.push(`title:(${query.trim().replace(/[():"]/g, " ")})`);
	const params = new URLSearchParams({
		q: terms.join(" AND "),
		rows: String(rows),
		page: "1",
		output: "json",
	});
	["identifier", "title", "year", "downloads", "creator"].forEach((f) =>
		params.append("fl[]", f),
	);
	params.append("sort[]", sort);
	const response = await fetch(
		`${API}/advancedsearch.php?${params.toString()}`,
	);
	if (!response.ok)
		throw new Error(`Internet Archive respondeu ${response.status}`);
	const data = await response.json();
	return (data.response?.docs || []).map((g) => ({
		...g,
		title: Array.isArray(g.title) ? g.title[0] : g.title,
		creator: Array.isArray(g.creator) ? g.creator[0] : g.creator,
	}));
}
export async function getItem(id) {
	const response = await fetch(`${API}/metadata/${encodeURIComponent(id)}`);
	if (!response.ok)
		throw new Error(`Não foi possível carregar o jogo (${response.status})`);
	const data = await response.json();
	const m = data.metadata || {};
	const first = (v) => (Array.isArray(v) ? v[0] : v);
	const list = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
	return {
		emulator: detectEmulator(m),
		identifier: id,
		title: first(m.title) || id,
		description: clean(first(m.description)),
		year: first(m.year) || first(m.date),
		creator: first(m.creator),
		subject: list(m.subject)
			.flatMap((s) => String(s).split(";"))
			.map((s) => s.trim())
			.filter(Boolean)
			.slice(0, 8),
		collection: list(m.collection),
	};
}
