import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GameCard } from "./GameCard";
import { styles } from "../styles/styles";
export function GameGrid({
	games,
	wide,
	loading,
	error,
	onOpen,
	largeIndicator = false,
}) {
	if (loading)
		return (
			<ActivityIndicator
				color="#55f2d0"
				size={largeIndicator ? "large" : "small"}
			/>
		);
	if (error) return <Text style={styles.error}>{error}</Text>;
	return (
		<View style={styles.gameGrid}>
			{games.map((game) => (
				<View key={game.identifier} style={{ width: wide ? "23.5%" : "48%" }}>
					<GameCard game={game} onPress={onOpen} />
				</View>
			))}
		</View>
	);
}
