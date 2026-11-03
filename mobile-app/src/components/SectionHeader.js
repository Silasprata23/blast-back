import React from "react";
import { Text, View } from "react-native";
import { styles } from "../styles/styles";
export function SectionHeader({ title, subtitle }) {
	return (
		<View style={styles.sectionHead}>
			<Text style={styles.heading}>{title}</Text>
			{subtitle ? <Text style={styles.muted}>{subtitle}</Text> : null}
		</View>
	);
}
