import React from "react";
import { Pressable, Text } from "react-native";
import { styles } from "../styles/styles";
export function ActionButton({ label, onPress, outline = false }) {
	return (
		<Pressable
			style={outline ? styles.outlineButton : styles.primaryButton}
			onPress={onPress}
		>
			<Text style={outline ? styles.outlineText : styles.primaryText}>
				{label}
			</Text>
		</Pressable>
	);
}
