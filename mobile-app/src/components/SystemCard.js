import React from "react";
import { Pressable, Text } from "react-native";
import { styles } from "../styles/styles";
export function SystemCard({ system, onPress }) {
	return (
		<Pressable style={styles.systemCard} onPress={() => onPress(system)}>
			<Text style={styles.systemEmoji}>{system.emoji}</Text>
			<Text style={styles.systemTitle}>{system.label}</Text>
		</Pressable>
	);
}
