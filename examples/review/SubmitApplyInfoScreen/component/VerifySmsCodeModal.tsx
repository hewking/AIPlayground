/*
 * @Author: Taro
 * @Date: 2023-02-28 18:10:46
 * @LastEditTime: 2023-09-11 12:33:19
 * @FilePath: /yzw-module/packages/module-recruit/src/screen/SubmitApplyInfoScreen/component/VerifySmsCodeModal.tsx
 *
 * @LastEditors: Please set LastEditors
 * @Description:
 */
import {
  StyleSheet,
  Text,
  Pressable,
  View,
  TouchableOpacity,
  DeviceEventEmitter,
  Platform,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSubmitApplyInfoScreenState } from "./type";
import { Palette, TextInput } from "@nirvana/element";
import AnimateWarpModal from "../../../components/AnimateWarpModal";
import { Toast } from "@nirvana/toast";
import { useHttpClient } from "@nirvana/net";
import { smsCodeTime } from "../hooks/useSubmitApplyInfoScreen";
import Modal from "react-native-modal";

export default function VerifySmsCodeModal() {
  const {
    modalVerifyTips,
    setModalVerifyTips,
    getValues,
    time,
    start,
    submitParams,
    submitFinish,
  } = useSubmitApplyInfoScreenState();
  const [smsCode, setSmsCode] = useState<string>();
  const [second, setSecond] = useState<string | number>(smsCodeTime);

  useEffect(() => {
    setSecond(time.second);
    if (Number(time.second) == smsCodeTime - 1) {
      getSmsCode();
    }
  }, [time.second]);

  const bindSmsCode = useHttpClient({
    url: "/mtg/verify/code/generate",
    method: "post",
    name: "yzmt",
  });
  const bindCheckSmsCode = useHttpClient({
    url: "/mtg/verify/code/check",
    method: "post",
    name: "yzmt",
  });
  const checkSmsCode = async () => {
    let params = {
      phone: getValues("connectPhone"),
      bizType: 0,
      applicationCode: "supplier-recruit",
      verifyCode: smsCode,
    };
    let { data } = await bindCheckSmsCode({
      data: params,
    });
    if (data.success) {
      submitFinish(submitParams);
    } else {
      Toast.fail(data.message);
    }
  };

  const getSmsCode = async () => {
    let params = {
      phone: getValues("connectPhone"),
      bizType: 0,
      applicationCode: "supplier-recruit",
    };
    let { data } = await bindSmsCode({
      data: params,
    });
    if (data.success) {
      console.log("获取验证码成功");
    } else {
      setModalVerifyTips(false);
      Toast.fail(data.message);
    }
  };
  const renderContent = () => (
    <>
      <View style={{ padding: 10 }}>
        <Text style={styles.title}>手机号验证</Text>
        <Text style={styles.subTitle}>手机号</Text>
        <Text style={styles.phone}>{getValues("connectPhone")}</Text>
        <Text style={[styles.subTitle, { paddingTop: 10 }]}>短信验证码</Text>
        <View style={styles.sms}>
          <TextInput
            maxLength={6}
            placeholderTextColor={Palette.Text.Tip}
            placeholder="请输入短信验证码"
            placeholderStyle={{
              fontSize: 12,
            }}
            style={{
              fontSize: 12,
            }}
            clearVisible={false}
            value={smsCode}
            onChangeText={(v) => {
              setSmsCode(v);
            }}
            containerStyle={styles.smsTextInput}
          />
          <TouchableOpacity
            activeOpacity={second == 0 ? 0.7 : 1}
            onPress={() => {
              if (Number(second) > 0) return;
              start();
            }}
            style={[
              styles.smsCode,
              {
                backgroundColor: second == 0 ? "#ff7500" : Palette.Text.Tip,
              },
            ]}
          >
            <Text style={{ color: "#fff", fontSize: 12, paddingHorizontal: 5 }}>
              {second == 0 ? "获取验证码" : `${second}秒后重试`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.dialogBtn}>
        <Pressable
          style={styles.dialogBtnLeft}
          onPress={() => {
            setModalVerifyTips(false);
          }}
        >
          <Text>取消</Text>
        </Pressable>
        <Pressable
          style={styles.dialogBtnRight}
          onPress={() => {
            setModalVerifyTips(false);
            // if (second == 0) return Toast.fail("请先获取验证码");
            if (!smsCode) return Toast.fail("请输入验证码");
            checkSmsCode();
          }}
        >
          <Text style={{ color: "#ff7500" }}>确定</Text>
        </Pressable>
      </View>
    </>
  );
  if (Platform.OS !== "web") {
    return (
      <Modal
        isVisible={modalVerifyTips}
        deviceHeight={Dimensions.get("screen").height}
        deviceWidth={Dimensions.get("screen").width}
        animationIn="slideInUp"
        animationOut="fadeOut"
        hideModalContentWhileAnimating
        useNativeDriver
        propagateSwipe
        avoidKeyboard
        onBackButtonPress={() => {
          setModalVerifyTips(false);
        }}
        onBackdropPress={() => {
          setModalVerifyTips(false);
        }}
        style={{
          margin: 0,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 4,
            minWidth: Dimensions.get("screen").width * 0.7,
          }}
        >
          {renderContent()}
        </View>
      </Modal>
    );
  }
  return (
    <AnimateWarpModal
      visible={modalVerifyTips}
      onBackDropPress={() => {
        setModalVerifyTips(false);
      }}
      onRequestClose={() => {
        setModalVerifyTips(false);
      }}
    >
      <Pressable style={styles.applyModalView}>{renderContent()}</Pressable>
    </AnimateWarpModal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: "#fff",
    justifyContent: "center",
    marginHorizontal: "10%",
    borderRadius: 10,
  },
  applyModalView: {
    flex: 1,
    margin: 0,
    borderRadius: 10,
  },
  mainModal: {
    justifyContent: "flex-end",
    flex: 1,
    backgroundColor: "rgba(0,0,0,.5)",
  },
  dialogBtn: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#eee",
  },
  dialogBtnLeft: {
    flex: 1,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  dialogBtnRight: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 38,
  },
  sms: {
    flexDirection: "row",
    alignItems: "center",
  },
  smsTextInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    height: 30,
    paddingHorizontal: 3,
    flex: 1,
  },
  smsCode: {
    marginLeft: 10,
    backgroundColor: "#ff7500",
    justifyContent: "center",
    alignItems: "center",
    height: 30,
    borderRadius: 4,
  },
  phone: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    color: Palette.Text.Tip,
    paddingBottom: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  subTitle: {
    paddingVertical: 5,
  },
});
