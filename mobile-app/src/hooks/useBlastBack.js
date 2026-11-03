import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LAST_KEY, SAVE_KEY, SORTS } from "../constants/catalog";
import { getItem, searchGames } from "../services/archiveService";

export function useBlastBack() {
	const [screen, setScreen] = useState("home");
	const [games, setGames] = useState([]);
	const [selectedSystem, setSelectedSystem] = useState(null);
	const [selectedGame, setSelectedGame] = useState(null);
	const [detail, setDetail] = useState(null);
	const [query, setQuery] = useState("");
	const [sort, setSort] = useState(SORTS[0].value);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [saves, setSaves] = useState([]);
	const [lastSession, setLastSession] = useState(null);
	const [showResume, setShowResume] = useState(false);
	const startedAt = useRef(Date.now());

	const loadSaves = useCallback(async () => {
		try {
			const [raw, last] = await Promise.all([
				AsyncStorage.getItem(SAVE_KEY),
				AsyncStorage.getItem(LAST_KEY),
			]);
			const parsed = raw ? JSON.parse(raw) : [];
			setSaves(Array.isArray(parsed) ? parsed : []);
			setLastSession(last ? JSON.parse(last) : null);
			setShowResume(Boolean(last));
		} catch {
			setSaves([]);
			setLastSession(null);
		}
	}, []);
	useEffect(() => {
		loadSaves();
	}, [loadSaves]);
	useEffect(() => {
		const subscription = AppState.addEventListener("change", async (state) => {
			if (
				(state === "background" || state === "inactive") &&
				selectedGame?.identifier
			) {
				const session = {
					identifier: selectedGame.identifier,
					title: selectedGame.title || selectedGame.identifier,
					savedAt: new Date().toISOString(),
					elapsedSeconds: Math.max(
						0,
						Math.floor((Date.now() - startedAt.current) / 1000),
					),
				};
				try {
					await AsyncStorage.setItem(LAST_KEY, JSON.stringify(session));
					setLastSession(session);
				} catch {}
			}
		});
		return () => subscription.remove();
	}, [selectedGame]);

	const loadGames = useCallback(async (opts = {}) => {
		setLoading(true);
		setError("");
		try {
			setGames(await searchGames(opts));
		} catch (e) {
			setError(e.message || "Erro ao buscar jogos.");
		} finally {
			setLoading(false);
		}
	}, []);
	useEffect(() => {
		loadGames({ rows: 24 });
	}, [loadGames]);

	const openGame = async (game) => {
		setSelectedGame(game);
		setScreen("detail");
		setDetail(null);
		setError("");
		try {
			setDetail(await getItem(game.identifier));
		} catch (e) {
			setError(e.message);
		}
	};
	const play = async (game) => {
		const full = game || selectedGame;
		if (!full?.identifier) return;
		setSelectedGame(full);
		setScreen("player");
		startedAt.current = Date.now();
		const session = {
			identifier: full.identifier,
			title: full.title || full.identifier,
			savedAt: new Date().toISOString(),
		};
		try {
			await AsyncStorage.setItem(LAST_KEY, JSON.stringify(session));
			setLastSession(session);
		} catch {
			/* O jogo continua mesmo se o armazenamento estiver indisponível. */
		}
	};
	const saveGame = async () => {
		if (!selectedGame?.identifier) return;
		const entry = {
			identifier: selectedGame.identifier,
			title: selectedGame.title || selectedGame.identifier,
			savedAt: new Date().toISOString(),
			elapsedSeconds: Math.max(
				0,
				Math.floor((Date.now() - startedAt.current) / 1000),
			),
		};
		try {
			const next = [
				entry,
				...saves.filter((s) => s.identifier !== entry.identifier),
			].slice(0, 30);
			await AsyncStorage.multiSet([
				[SAVE_KEY, JSON.stringify(next)],
				[LAST_KEY, JSON.stringify(entry)],
			]);
			setSaves(next);
			setLastSession(entry);
			Alert.alert(
				"Sessão salva",
				"O jogo foi adicionado aos seus salvos. Você poderá reabri-lo na próxima sessão.",
			);
		} catch {
			Alert.alert(
				"Não foi possível salvar",
				"Verifique o espaço disponível no dispositivo.",
			);
		}
	};
	const resumeLast = async () => {
		if (!lastSession) return;
		await play({
			identifier: lastSession.identifier,
			title: lastSession.title,
		});
		setShowResume(false);
	};
	const removeSave = async (id) => {
		const next = saves.filter((s) => s.identifier !== id);
		setSaves(next);
		await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(next));
	};

	return {
		screen,
		setScreen,
		games,
		setGames,
		selectedSystem,
		setSelectedSystem,
		selectedGame,
		detail,
		query,
		setQuery,
		sort,
		setSort,
		loading,
		error,
		saves,
		lastSession,
		showResume,
		loadGames,
		openGame,
		play,
		saveGame,
		resumeLast,
		removeSave,
	};
}
