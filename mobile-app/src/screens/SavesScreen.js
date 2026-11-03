import React from "react";
import { Text } from "react-native";
import { SavedGameRow } from "../components/SavedGameRow";
import { SectionHeader } from "../components/SectionHeader";
import { styles } from "../styles/styles";
export function SavesScreen({ saves, play, removeSave }) {
	return (
		<>
			<SectionHeader
				title="Jogos salvos"
				subtitle="Suas sessões ficam armazenadas neste dispositivo"
			/>
			{saves.length === 0 ? (
				<Text style={styles.muted}>Você ainda não salvou nenhuma sessão.</Text>
			) : (
				saves.map((session) => (
					<SavedGameRow
						key={session.identifier}
						session={session}
						onOpen={play}
						onRemove={removeSave}
					/>
				))
			)}
		</>
	);
}
