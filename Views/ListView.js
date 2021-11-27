import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Searchbar } from "react-native-paper";
import data from "./ligands.json";
import { useHistory } from "react-router-native";
import useOrientation from "../Hooks/useOrientation";
import { useParse } from "../Hooks/useParser";
import Axios from "axios";

const List = () => {
  const history = useHistory();
  const [listData, setdata] = React.useState(data);
  const [searchQuery, setSearchQuery] = React.useState("");
  const orientation = useOrientation();

  //get Ligand
  const getLigand = (item) => {
    Axios(
      `https://files.rcsb.org/ligands/view/${item}_model.pdb`
    )
      .then((res) => {
        const parsed = useParse(res.data);
        history.push({
          pathname: '/protein',
          state: { data: parsed }
      });
      })
      .catch((er) => console.log("e", er));
  }

  // setSearchQuery
  const onHandleChange = (query) => {
    if (query === "") setdata(data);
    setSearchQuery(query);
    var regex = new RegExp(query, "g");
    let tmp = data.filter((el) => el.match(regex));
    setdata(tmp);
  };
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <TouchableOpacity onPress={() => getLigand(item)}>
        <Text style={styles.text}>{item}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={
      orientation === "portrait"
        ? styles.container
        : styles_landscape.container
    }>
      <Searchbar
        placeholder="Search"
        onChangeText={onHandleChange}
        value={searchQuery}
      />
      <FlatList
        style={styles.list}
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item}
      />
    </SafeAreaView>
  );
};
export default List;


const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffff",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    color: "#ffff",
    marginTop: 20,
    paddingTop: 40
  },
  item: {
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    // color: "#fff",
    textAlign: "center",
    backgroundColor: "#ffff",
    margin: 5,
    padding: 10,
    fontSize: 15,
  },
  list: {
    width: "100%",
  },
});

const styles_landscape = StyleSheet.create({
  container: {
    backgroundColor: "#ffff",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    color: "#ffff",
    marginTop: 20,
    paddingTop: 40
  },
  row: { flexDirection: "row", width: "100%", height: "100%" },
  col1: { flex: 3, justifyContent: "center", alignItems: "center" },
  col2: { flex: 3, paddingTop: 20 },
});
