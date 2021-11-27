import React, { useEffect, useRef, useState } from "react";
import { ProteinView } from "./Views/ProteinView";
import Home from "./Views/Home";
import List from "./Views/ListView";
import NetInfo from "@react-native-community/netinfo";
import { NativeRouter, Route } from "react-router-native";

import { useHistory } from 'react-router';


export default function App() {
	const history = useHistory()

	//Check connection if Available
	useEffect(() => {
		NetInfo.addEventListener(state => {
			if (!state.isConnected)
				alert('Oops!',
					'Please Check Your Internet Connection!',
					[
						{ text: "Try again", onPress: () => null }
					],
					{ cancelable: false })
		});
	}, [])


	return (

		<NativeRouter>
			<Route exact path="/" component={Home} />
			<Route path="/list" component={List} />
			<Route path="/protein" component={ProteinView} />
		</NativeRouter>
	);
}