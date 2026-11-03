import React from "react";
import { Pressable, Text, View } from "react-native";
import { ActionButton } from "./ActionButton";
import { styles } from "../styles/styles";
export function SavedGameRow({ session, onOpen, onRemove }) {
	return (
		<View style={styles.savedRow}>
			<View style={{ flex: 1 }}>
				<Text style={styles.gameTitle}>{session.title}</Text>
				<Text style={styles.muted}>
					Salvo em {new Date(session.savedAt).toLocaleString("pt-BR")}
				</Text>
			</View>
			<ActionButton
				label="ABRIR"
				onPress={() =>
					onOpen({ identifier: session.identifier, title: session.title })
				}
			/>
			<Pressable onPress={() => onRemove(session.identifier)}>
				<Text style={styles.deleteText}>×</Text>
			</Pressable>
		</View>
	);
}
