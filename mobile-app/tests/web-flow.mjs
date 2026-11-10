import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import { JSDOM } from "jsdom";

test("exported web app handles failed fonts, storage retries, removal and scoped filters", async (t) => {
	const directory =
		process.env.EXPO_WEB_DIR ||
		(await mkdtemp(path.join(tmpdir(), "blast-web-")));
	if (!process.env.EXPO_WEB_DIR) {
		t.after(() => rm(directory, { recursive: true, force: true }));
		execFileSync(
			process.execPath,
			[
				"node_modules/expo/bin/cli",
				"export",
				"--platform",
				"web",
				"--output-dir",
				directory,
			],
			{ stdio: "inherit" },
		);
	}
	const html = await readFile(path.join(directory, "index.html"), "utf8");
	const dom = new JSDOM(html, {
		url: "https://blast.test",
		runScripts: "outside-only",
		pretendToBeVisual: true,
	});
	const { window } = dom;
	const { document } = window;
	t.after(() => window.close());
	let emptyResults = false;
	let metadataRequests = 0;
	let fontRequests = 0;
	window.CSSFontFaceRule = class {};
	document.fonts = {
		load: async () => {
			fontRequests++;
			throw Error("font unavailable");
		},
	};
	window.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
	window.TextDecoder = TextDecoder;
	window.TextEncoder = TextEncoder;
	window.fetch = async (url) => {
		if (String(url).includes("/advancedsearch.php"))
			return Response.json({
				response: {
					numFound: emptyResults ? 0 : 1,
					docs: emptyResults ? [] : [{ identifier: "pac", title: "Pac Man" }],
				},
			});
		if (String(url).includes("/metadata/pac")) {
			metadataRequests++;
			return Response.json({
				metadata: {
					title: "Pac Man",
					collection: "internetarcade",
					emulator: "mame",
				},
			});
		}
		throw Error(`Unexpected request: ${url}`);
	};
	const script = document.querySelector("script[src]").getAttribute("src");
	const getItem = window.Storage.prototype.getItem;
	window.Storage.prototype.getItem = () => {
		throw Error("storage temporarily unavailable");
	};
	window.eval(await readFile(path.join(directory, script), "utf8"));
	async function wait(fn, description) {
		for (let i = 0; i < 160; i++) {
			const value = fn();
			if (value) return value;
			await delay(20);
		}
		assert.fail(`${description}: ${document.body.textContent}`);
	}
	const find = (label) =>
		[
			...document.querySelectorAll(
				"button,[role=button],[role=radio],[role=tab]",
			),
		].find(
			(el) =>
				el.textContent.trim() === label ||
				el.getAttribute("aria-label") === label,
		);
	const click = async (label) => (await wait(() => find(label), label)).click();
	const screenText = (text) =>
		wait(() => document.body.textContent.includes(text), text);
	const state = () =>
		JSON.parse(window.localStorage.getItem("@blastback/library-v1"));
	await click("Ver detalhes de Pac Man");
	assert.ok(fontRequests > 0);
	await click("JOGAR AGORA");
	await screenText("Tentar novamente");
	assert.ok(
		find("Salvar").disabled ||
			find("Salvar").getAttribute("aria-disabled") === "true",
	);
	window.Storage.prototype.getItem = getItem;
	await click("Tentar carregar salvos");
	await wait(() => state()?.last, "storage retry");
	await click("‹ Voltar");
	await click("SALVAR NA MINHA LISTA");
	await wait(() => find("REMOVER DA MINHA LISTA"), "saved from details");
	await click("JOGAR AGORA");
	await screenText("Emulador: mame");
	assert.equal(metadataRequests, 2);
	await wait(() => state()?.last, "player session");
	const write = window.Storage.prototype.setItem;
	window.Storage.prototype.setItem = () => {
		throw Error("quota");
	};
	await click("Salvar");
	await screenText("Não foi possível salvar.");
	assert.equal(state().saved[0].elapsedSeconds, undefined);
	window.Storage.prototype.setItem = write;
	await delay(1050);
	await click("Salvar");
	await screenText("Sessão salva.");
	assert.ok(state().saved[0].elapsedSeconds >= 1);
	assert.deepEqual(state().saved[0], state().last);
	await click("‹ Voltar");
	await click("Salvos");
	const remove = await wait(
		() => find("Remover Pac Man dos salvos"),
		"remove button",
	);
	remove.click();
	remove.click();
	await click("EXPLORAR SISTEMAS");
	assert.deepEqual(state().saved, []);
	await click("Buscar");
	await click("ORDEM: MAIS JOGADOS");
	await click("○  Consoles");
	await click("APLICAR");
	await click("Sistemas");
	await click("Explorar Arcade");
	await click("ORDEM: MAIS JOGADOS");
	await click("LIMPAR FILTROS");
	await click("Buscar");
	await click("ORDEM: MAIS JOGADOS · FILTRADO");
	await click("LIMPAR FILTROS");
	await wait(() => find("ORDEM: MAIS JOGADOS"), "reset search filters");
	emptyResults = true;
	await click("BUSCAR JOGOS");
	await click("LIMPAR PESQUISA");
});
