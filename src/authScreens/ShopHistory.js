import React, { useCallback, useEffect, useState } from "react";
import Wrapper from "./../../components/fixedElements/Wrapper";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import SuccessModal from "../../components/modals/successModal";
import { ShopHistoryRenderedItems } from "../../components/historyItems/historyItems";
import { useDispatch, useSelector } from "react-redux";
import {
  clearPagination,
  getAllHistoryRequest,
} from "../../store/authReducer/getAllHistorySlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextColor } from "../../components/colors/colors";
import { deleteHistoryRequest } from "../../store/authReducer/deleteHistorySlice";
import "moment/locale/ru";

const { width } = Dimensions.get("window");

export default ShopHistory = ({}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const state = useSelector(state1 => state1);
  const { all_history, loading, stop_paginate, current_page } =
    state.getAllHistorySlice;
  const { success_delate } = state.deleteHistorySlice;
  const [token, setToken] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [allData,setAllData] = useState([])
  const [loading1,setLoading] = useState(true)

  // useEffect(() => {
  //   AsyncStorage.getItem("userToken").then(userToken => {
  //     setToken(userToken);
  //     dispatch(getAllHistoryRequest({ token: userToken, page: current_page }));
  //   });
  // }, [navigation]);


  useEffect(() => {
    const focus = navigation.addListener('focus', () => {
      setLoading(true)
      setAllData([])
      AsyncStorage.getItem("userToken").then(userToken => {
        setToken(userToken);
        dispatch(getAllHistoryRequest({ token: userToken, page: current_page })).then(()=>{
          setLoading(false)
        });
      });
    });

    return () => {
      return focus();
    };
  }, [navigation]);

  // useEffect(() => {
  //   dispatch(getAllHistoryRequest({ token: token, page: 1 }));
  // }, [success_delate]);

  const onRefresh = useCallback(() => {
    dispatch(clearPagination());
    if (!loading && refresh) {
      dispatch(getAllHistoryRequest({ token: token, page: current_page }));
    }
  }, []);

  const handleLoadMore = () => {
    if (!stop_paginate && !loading) {
      dispatch(getAllHistoryRequest({ token: token, page: current_page }));
      return false;
    }
  };
  useEffect(()=>{
    setAllData(all_history)
    setLoading(false)
  },[all_history])

  const DeleteData = (index) =>{
    let item = [...allData]
    item.splice(index,1)
    setAllData(item)
  }

  const renderItem = ({ item, index }) => {
    return (
      <ShopHistoryRenderedItems
        image={item?.get_product?.get_product_image[0]?.image}
        title={item?.get_product?.title}
        price={item?.get_product?.price}
        gram={item?.get_product?.dimension}
        info={item?.get_product?.description}
        dateTime={item?.date}
        navigation={() =>
          navigation.navigate("SinglePage", {
            screen: "SinglePage",
            parameter: item.id,
          })
        }
        deleteProduct={
          () => {
            DeleteData(index)
            dispatch(deleteHistoryRequest(item.id));
          }
        }
      />
    );
  };

  return (
    <Wrapper
      leftIcon={true}
      rightIcon={false}
      title={"История покупок"}
      bottomLine={true}
      styleProps={{ marginBottom: 10 }}
      goBack={() => navigation.goBack()}>
      <FlatList
        data={allData}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={loading || loading1 ? <ActivityIndicator color={'#BF8838'} size={50} /> : null}
        refreshControl={
          <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => {
          if (!loading && !refresh && !loading1) {
            return (
              <View style={styles.emptyParent}>
                <Text style={styles.emptyText}>Нет продуктов</Text>
              </View>
            );
          }
        }}
      />
    </Wrapper>
  );
};
const styles = StyleSheet.create({
  emptyParent: {
    flex: 1,
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 20,
    textAlign: "center",
    color: TextColor,
  },
});
