import React from "react";
import { Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";
import { GameGrid } from "../components/GameGrid";
import { ResumeCard } from "../components/ResumeCard";
import { SectionHeader } from "../components/SectionHeader";
import { styles } from "../styles/styles";
export function HomeScreen({
	navigate,
	showResume,
	lastSession,
	resumeLast,
	games,
	wide,
	loading,
	error,
	openGame,
	loadGames,
}) {
	return (
		<>
			<View style={styles.hero}>
				<Text style={styles.kicker}>INSERT COIN</Text>
				<Text style={styles.heroTitle}>BLAST BACK</Text>
				<Text style={styles.heroText}>
					Reviva os clássicos dos videogames em qualquer lugar.
				</Text>
				<View style={styles.heroActions}>
					<ActionButton
						label="VER SISTEMAS"
						onPress={() => navigate("systems")}
					/>
					<ActionButton
						outline
						label="BUSCAR JOGOS"
						onPress={() => navigate("search")}
					/>
				</View>
			</View>
			{showResume && lastSession && (
				<ResumeCard session={lastSession} onResume={resumeLast} />
			)}
			<SectionHeader
				title="Jogos populares"
				subtitle="Clássicos disponíveis no Internet Archive"
			/>
			<GameGrid
				{...{ games, wide, loading, error }}
				onOpen={openGame}
				largeIndicator
			/>
			<ActionButton
				outline
				label="ATUALIZAR LISTA"
				onPress={() => loadGames({ rows: 48 })}
			/>
		</>
	);
}
