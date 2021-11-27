import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableHighlight, AppState, Image } from "react-native";
import * as LocalAuthentication from 'expo-local-authentication'
import { useHistory } from 'react-router';
import useOrientation from "../Hooks/useOrientation";

const Home = (props) => {

	const history = useHistory()
	const [isSupported, setisSupported] = useState(false);
	const orientation = useOrientation();
	const appState = useRef(AppState.currentState);

	// Homw Screen always be displayed when relaunching the app
	useEffect(() => {
		const subscription = AppState.addEventListener("change", nextAppState => {
			if (
				appState.current.match(/inactive|background/) &&
				nextAppState === "active"
			) {
				history.push("/")
			}
			appState.current = nextAppState;
		});
	}, [])

	//Check if TouchID or FaceID is supported by the app 
	useEffect(async () => {
		const savedBiometrics = await LocalAuthentication.isEnrolledAsync();
		if (!savedBiometrics)
			return alert(
				'Biometric record not found',
				'Please verify your identity with your password',
				'OK',
				() => fallBackToDefaultAuth()
			);
		const compatible = LocalAuthentication.hasHardwareAsync();
		if (compatible) {
			setisSupported(compatible);
		}
	}, [])

	//handle login with biometricAuth
	const handleBiometricAuth = async () => {
		const biometricAuth = await LocalAuthentication.authenticateAsync({
			promptMessage: 'Login with your TouchId/FaceId',
			disableDeviceFallback: true,
			cancelLabel: "Cancel",
		});
		if (!biometricAuth.success)
			// alert(
			// 	'Your login Failed, Please try again',
			// 	'OK',
			// );
		history.push("/List");
		else history.push("/List");
	}
	return (
		<View style={
			orientation === "portrait"
				? styles.container
				: styles_landscape.container
		}>
			<Image source={require("../assets/image2.png")} style={styles.img} />
			<TouchableHighlight style={styles.btn} onPress={handleBiometricAuth}>
				<Text style={styles.text}>
					Login
				</Text>
			</TouchableHighlight>
		</View>
	);
};

export default Home;



const styles = StyleSheet.create({
	container: {
		backgroundColor: "#ffff",
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		color: "#ffff",
		paddingTop: 50,
	},
	row: { width: "100%", height: "100%" },
	col1: { flex: 1, justifyContent: "center", alignItems: "center" },
	col2: { flex: 3 },

	btn: {
		width: 150,
		height: 30,
		textAlign: "center",
		borderRadius: 20,
		backgroundColor: "red",

	},
	finger: {
		width: 300,
		height: 300,
		textAlign: "center",
		padding: 40,
		borderRadius: 150,
		backgroundColor: "gray",
		overflow: "hidden",
		color: "#fff",
	},
	text: {
		color: "#fff",
		textAlign: "center",
		lineHeight: 30,
	},
	img: {
		width: 300,
		height: 300,

	}
});
const styles_landscape = StyleSheet.create({
	container: {
		backgroundColor: "#ffff",
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		color: "#ffff",
	},
	row: { flexDirection: "row", width: "100%", height: "100%" },
	col1: { flex: 3, justifyContent: "center", alignItems: "center" },
	col2: { flex: 3, paddingTop: 20 },
});