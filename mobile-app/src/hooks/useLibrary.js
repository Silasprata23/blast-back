import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import {
	createLibraryStore,
	LIBRARY_KEY,
	readLibrary,
} from "../services/storage.mjs";

export function useLibrary() {
	const [library, setLibrary] = useState({ saved: [], last: null });
	const [ready, setReady] = useState(false);
	const [error, setError] = useState("");
	const [store] = useState(() =>
		createLibraryStore(
			(state) => AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(state)),
			setLibrary,
		),
	);
	const reload = useCallback(() => {
		setReady(false);
		setError("");
		store
			.restore(() => readLibrary((key) => AsyncStorage.getItem(key)))
			.then(() => {
				setReady(true);
			})
			.catch(() => {
				setError(
					"Não foi possível ler seus salvos neste dispositivo. Tente novamente.",
				);
			});
	}, [store]);
	useEffect(() => {
		reload();
	}, [reload]);

	function editFavorite(action, game) {
		setError("");
		action(game).catch(() =>
			setError("Não foi possível atualizar seus salvos. Tente novamente."),
		);
	}
	return {
		...library,
		ready,
		error,
		reload,
		isSaved: (id) => library.saved.some((game) => game.identifier === id),
		add: (game) => editFavorite(store.add, game),
		remove: (game) => editFavorite(store.remove, game),
		saveSession: store.saveSession,
		remember: store.remember,
	};
}
