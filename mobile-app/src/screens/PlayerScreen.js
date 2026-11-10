import React, { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Platform,
	Pressable,
	StatusBar,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { TouchControls } from "../components/TouchControls";
import {
	CONTROL_PROFILES,
	PROFILE_IDS,
	chooseControlProfile,
} from "../constants/controlProfiles";
import { embed } from "../constants/catalog";
import { getItem } from "../services/archiveService";
import { makeKeyboardScript } from "../services/keyboardBridge";
import { styles } from "../styles/styles";

export function PlayerScreen({
	selectedGame,
	saveGame,
	navigate,
	width,
	height,
	detail,
}) {
	const [emulatorInfo, setEmulatorInfo] = useState({
		status: "loading",
		emulator: null,
		collection: [],
	});
	const [manualProfile, setManualProfile] = useState(null);
	const [webReady, setWebReady] = useState(false);
	const webRef = useRef(null);
	const id = selectedGame?.identifier;

	useEffect(() => {
		setManualProfile(null);
		setWebReady(false);
	}, [id]);
	useEffect(() => {
		let active = true;
		if (!id) return undefined;
		if (detail?.identifier === id && detail?.emulator) {
			setEmulatorInfo({
				status: "ready",
				emulator: detail.emulator,
				collection: detail.collection || [],
			});
			return undefined;
		}
		setEmulatorInfo({ status: "loading", emulator: null, collection: [] });
		getItem(id)
			.then((item) => {
				if (active)
					setEmulatorInfo({
						status: "ready",
						emulator: item.emulator,
						collection: item.collection || [],
					});
			})
			.catch((error) => {
				if (active)
					setEmulatorInfo({
						status: "error",
						emulator: null,
						collection: [],
						error: error.message,
					});
			});
		return () => {
			active = false;
		};
	}, [id, detail]);

	const detected = chooseControlProfile(
		emulatorInfo.emulator,
		emulatorInfo.collection,
	);
	const profileId = manualProfile || detected.id;
	const profile = CONTROL_PROFILES[profileId];
	const sendKey = (key, down) => {
		if (!webReady || !key) return;
		webRef.current?.injectJavaScript(makeKeyboardScript(key, down));
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="light-content" />
			<View style={styles.playerTop}>
				<Pressable onPress={() => navigate("detail")}>
					<Text style={styles.navActive}>‹ Voltar</Text>
				</Pressable>
				<Text numberOfLines={1} style={styles.playerTitle}>
					{selectedGame.title || selectedGame.identifier}
				</Text>
				<Pressable onPress={saveGame} style={styles.saveButton}>
					<Text style={styles.saveText}>Salvar</Text>
				</Pressable>
			</View>
			<View style={styles.webWrap}>
				{Platform.OS === "web" ? (
					<iframe title={selectedGame.title || id} src={embed(id)} allowFullScreen style={{ width: "100%", height: "100%", border: 0 }} />
				) : (
				<WebView
					ref={webRef}
					source={{ uri: embed(id) }}
					javaScriptEnabled
					domStorageEnabled
					allowsFullscreenVideo
					allowsInlineMediaPlayback
					mediaPlaybackRequiresUserAction={false}
					originWhitelist={["https://*"]}
					style={styles.webview}
					startInLoadingState
					onLoadStart={() => setWebReady(false)}
					onLoadEnd={() => setWebReady(true)}
					renderLoading={() => (
						<ActivityIndicator color="#C1CB8D" size="large" />
					)}
				/>
				)}
			</View>
			<View style={styles.playerHint}>
				<Text style={styles.emulatorLabel} accessibilityRole="text">
					{emulatorInfo.status === "loading"
						? "Emulador: identificando..."
						: emulatorInfo.status === "error"
							? "Emulador: consulta indisponível"
							: `Emulador: ${emulatorInfo.emulator?.name || "Não informado"}`}
				</Text>
				<Text style={styles.muted}>
					Perfil: {profile.label} —{" "}
					{manualProfile ? "selecionado manualmente" : detected.reason}
				</Text>
				<View style={styles.profileRow}>
					{PROFILE_IDS.map((p) => (
						<Pressable
							accessibilityRole="button"
							accessibilityState={{ selected: profileId === p }}
							key={p}
							onPress={() => setManualProfile(p)}
							style={[
								styles.profileChip,
								profileId === p && styles.profileChipActive,
							]}
						>
							<Text style={styles.profileChipText}>
								{CONTROL_PROFILES[p].label}
							</Text>
						</Pressable>
					))}
				</View>

				<Text style={styles.muted}>
					Se o jogo não responder, toque na área do jogo e teste outro perfil.
					Iframes externos podem bloquear teclas simuladas.
				</Text>
			</View>
			{Platform.OS !== "web" && (
				<TouchControls
					sendKey={sendKey}
					keys={profile.keys}
					width={width}
					height={height}
				/>
			)}
		</SafeAreaView>
	);
}
