import React from "react";
import { Pressable, Text } from "react-native";
import { styles } from "../styles/styles";
export function TouchButton({
	label,
	keyName,
	sendKey,
	size = 54,
	accent = false,
	small = false,
}) {
	return (
		<Pressable
			onPressIn={() => sendKey(keyName, true)}
			onPressOut={() => sendKey(keyName, false)}
			onTouchCancel={() => sendKey(keyName, false)}
			style={({ pressed }) => [
				styles.touchButton,
				{
					width: small ? 76 : size,
					height: small ? 42 : size,
					borderRadius: small ? 10 : Math.max(12, size * 0.25),
					backgroundColor: accent ? "#9f3e2f" : "#414638",
					opacity: pressed ? 0.65 : 1,
				},
			]}
		>
			<Text style={[styles.touchLabel, { fontSize: small ? 10 : 22 }]}>
				{label}
			</Text>
		</Pressable>
	);
}
