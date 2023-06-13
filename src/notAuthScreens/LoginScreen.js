import { Button, StyleSheet, Text, View } from "react-native";
import Wrapper from "../../components/fixedElements/Wrapper";
import { ButtonColor, TextColor } from "../../components/colors/colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import InputContainer from "../../components/inputs/InputContainer";
import { BigButton } from "../../components/buttons/bigButton";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { clearLoginState, loginRequest } from "../../store/reducer/loginSlice";
import { useDispatch, useSelector } from "react-redux";
import PhoneInput from "./../../components/inputs/phoneInput";
import RNRestart from "react-native-restart";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default LoginScreen = ({}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [eye, setEye] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const state = useSelector(state => state);
  const { password_error, phone_error, user_not_verify, loading, success_login } =state.loginSlice;
  const [errors,setErrors] = useState({password:'',phone_error:''})
  useEffect(() => {
    if (user_not_verify) {
      navigation.navigate("ConfirmPhoneRegister", {
        parameter: phone,
      });
      dispatch(clearLoginState());
      setPassword("");
      setPhone("");
    }
  }, [user_not_verify]);
  useEffect(()=>{
    let item ={...password}
    item.password = password_error
    item.phone_error = phone_error
    if(phone.length<18){
      item.phone_error = 'Введите корректный номер телефона '
    }
    setErrors(item)
  },[password_error,phone_error])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setErrors({password:'',phone_error:''})
    });
    return unsubscribe;
  }, [navigation]);
  return (
    <Wrapper leftIcon={true} goBack={() => navigation.goBack()}>
      <KeyboardAwareScrollView>
        <Text style={styles.title}>Вход</Text>
        <PhoneInput
          label={"Номер телефона"}
          keyboardType={"phone-pad"}
          propsStyle={styles.firstInput}
          onChangeText={e => {
            setPhone(e);
            dispatch(clearLoginState())
          }}
          value={phone}
          error={errors.phone_error}
        />
        <InputContainer
          label={"Пароль"}
          keyboardType={"default"}
          secureTextEntry={eye}
          setEye={() => setEye(!eye)}
          password={true}
          onChangeText={e => {
            setPassword(e);
            dispatch(clearLoginState());
          }}
          value={password}
          error={errors.password}
        />
        <Text
          style={styles.forgotText}
          onPress={() => navigation.navigate("ForgotPassword")}>
          Забыли пароль?
        </Text>
        <BigButton
          buttonText={"Войти"}
          loading={loading}
          navigation={() => {
            dispatch(
              loginRequest({
                phone: phone,
                password: password,
              }),
            ).then(async login => {
              await AsyncStorage.setItem("userToken", login.payload.token).then(
                () => {
                  navigation.navigate("Catalog");
                },
              );
            });
          }}
        />
        <Text style={styles.haveAccount}>Нет аккаунта?</Text>
        <Text
          onPress={() => navigation.navigate("RegisterScreen")}
          style={styles.goToReg}>
          Зарегистрироваться
        </Text>
      </KeyboardAwareScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    marginTop: 114,
    color: TextColor,
    fontSize: 36,
    textAlign: "center",
    fontFamily: "Raleway-Medium",
    marginBottom: 30,
  },
  firstInput: {
    marginBottom: 15,
  },
  forgotText: {
    textAlign: "right",
    color: TextColor,
    marginTop: 10,
    fontFamily: "Montserrat-Medium",
    textDecorationLine: "underline",
  },
  haveAccount: {
    fontFamily: "Montserrat-Regular",
    fontSize: 15,
    color: TextColor,
    textAlign: "center",
    marginTop: 30,
  },
  goToReg: {
    color: ButtonColor,
    textAlign: "center",
    fontFamily: "Montserrat-SemiBold",
    fontSize: 15,
    marginBottom: 20,
  },
});
