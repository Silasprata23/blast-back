import React from "react";
import { Pressable, Text } from "react-native";
import { GameGrid } from "../components/GameGrid";
import { SectionHeader } from "../components/SectionHeader";
import { styles } from "../styles/styles";
export function SystemGamesScreen({
	selectedSystem,
	navigate,
	games,
	wide,
	loading,
	error,
	openGame,
}) {
	return (
		<>
			<SectionHeader
				title={selectedSystem?.label || "Jogos"}
				subtitle="Selecione um jogo para ver os detalhes"
			/>
			<Pressable onPress={() => navigate("systems")}>
				<Text style={styles.navActive}>‹ Voltar aos sistemas</Text>
			</Pressable>
			<GameGrid {...{ games, wide, loading, error }} onOpen={openGame} />
		</>
	);
}
