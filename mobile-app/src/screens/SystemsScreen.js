import React from "react";
import { View } from "react-native";
import { SectionHeader } from "../components/SectionHeader";
import { SystemCard } from "../components/SystemCard";
import { SYSTEMS } from "../constants/catalog";
import { styles } from "../styles/styles";
export function SystemsScreen({ onSelect }) {
	return (
		<>
			<SectionHeader
				title="Sistemas"
				subtitle="Escolha uma plataforma para explorar os jogos"
			/>
			<View style={styles.systemGrid}>
				{SYSTEMS.map((system) => (
					<SystemCard key={system.id} system={system} onPress={onSelect} />
				))}
			</View>
		</>
	);
}
