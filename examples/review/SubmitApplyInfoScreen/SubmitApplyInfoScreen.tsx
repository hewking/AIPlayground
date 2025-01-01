/*
 * @Author: Taro
 * @Date: 2022-12-05 10:33:06
 * @LastEditTime: 2023-06-09 17:24:19
 * @FilePath: /yzw-module/packages/module-recruit/src/screen/SubmitApplyInfoScreen/SubmitApplyInfoScreen.tsx
 *
 * @LastEditors: Taro
 * @Description: 提交报名信息页面
 */
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import React, { memo, useEffect, useMemo } from "react";
import { Button, Steps, StepsStep } from "@nirvana/element";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../../routers/generalRouterParamList";
import { SubmitApplyInfoScreenContext } from "./component/type";
import SupplyCategory from "./component/SupplyCategory";
import SupplyArea from "./component/SupplyArea";
import SupplyAdvanceFund from "./component/SupplyAdvanceFund";
import SupplyPaymentDays from "./component/SupplyPaymentDays";
import SupplyContact from "./component/SupplyContact";
import SupplayHightLight from "./component/SupplayHightLight";
import { Loading } from "@nirvana/element";
import { useSubmitApplyInfoScreen } from "./hooks/useSubmitApplyInfoScreen";
import { ClickEvent } from "@nirvana/tracker";
import moment from "moment";
import VerifySmsCodeModal from "./component/VerifySmsCodeModal";
// import { data } from "./utils";

type SubmitApplyInfoScreenProps = StackScreenProps<
  RootStackParamList,
  "SubmitApplyInfoScreen"
>;

const SubmitApplyInfoScreen = (props: SubmitApplyInfoScreenProps) => {
  const {
    route: {
      params: { recruitCode, recruitInfo, lastInfo },
    },
  } = props;

  // const { recruitCode, recruitInfo, lastInfo } = data;
  const insets = useSafeAreaInsets();
  const value = useSubmitApplyInfoScreen({
    recruitCode,
    recruitInfo,
    lastApplyInfo: lastInfo,
  });
  const { current, handleSubmit, submitOrNext, preStep, loading } = value;
  const renderContent = useMemo(() => {
    if (current === 0) {
      return <SupplyCategory />;
    }
    if (current === 1) {
      return <SupplyArea />;
    }
    if (current === 2) {

      return (
        <React.Fragment>
          {/* 是否接受垫支 */}
          {value.haveDznl ? <SupplyAdvanceFund />: null}
          {/* 是否接受账期 */}
          {/* <SupplyPaymentDays /> */}
          <SupplayHightLight />
        </React.Fragment>
      );
    }
    if (current === 3) {
      return (
        <React.Fragment>
          {/* 联系人 */}
          <SupplyContact />
        </React.Fragment>
      );
    }
    return null;
  }, [current]);

  useEffect(() => {
    new ClickEvent(
      "ek_recruitment_details_apply_now",
      "招募H5-招募详情-点击立即报名"
    )
      .setProperties({
        clickTime: moment().format("YYYY-MM-DD HH:mm:ss"),
      })
      .send();
    return () => {
      value.stop();
    };
  }, []);

  return (
    <SubmitApplyInfoScreenContext.Provider value={{ ...value }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          bounces={false}
          refreshControl={undefined}
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
            }}
          >
            <Steps
              primaryColor="#ff7500"
              current={current}
              style={{ marginVertical: 8 }}
            >
              <StepsStep
                title={
                  recruitInfo?.recruitVO?.categoryType === 0
                    ? "供应品类"
                    : "分包内容"
                }
              />
              <StepsStep title="供应区域" />
              <StepsStep title="企业信息" />
              <StepsStep title="联系信息" />
            </Steps>
          </View>
          <View style={{ flex: 1 }}>{renderContent}</View>
        </ScrollView>
        <View
          style={{
            paddingBottom: insets.bottom,
            flexDirection: "row",
            backgroundColor: "#fff",
          }}
        >
          <TouchableOpacity
            onPress={preStep}
            style={[
              styles.bottomButton,
              {
                backgroundColor: "#fff",
              },
            ]}
          >
            <Text style={{ color: "#ff9500", fontSize: 16 }}>
              {current === 0 ? "取消" : "上一步"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="recruit_submit_apply_info_next_button"
            onPress={handleSubmit(submitOrNext)}
            style={[styles.bottomButton]}
          >
            <Text style={{ color: "#ffffff", fontSize: 16 }}>
              {current === 3 ? "提交报名" : "下一步"}
            </Text>
          </TouchableOpacity>
        </View>
        {loading && <Loading color="#ff7700" />}
        <VerifySmsCodeModal />
      </View>
    </SubmitApplyInfoScreenContext.Provider>
  );
};
export default memo(SubmitApplyInfoScreen);

const styles = StyleSheet.create({
  bottomButton: {
    backgroundColor: "#f70",
    flex: 1,
    height: 45,
    borderWidth: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  areaNameItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    justifyContent: "space-between",
  },
  modalView: {
    height: "90%",
    backgroundColor: "#fff",
    justifyContent: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 5,
  },
  applyModalView: {
    height: "50%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 5,
  },
  mainModal: {
    justifyContent: "flex-end",
    flex: 1,
    backgroundColor: "rgba(0,0,0,.5)",
  },
  formTitle: {
    flex: 1,
    textAlign: "right",
    color: "#ccc",
  },
  fromInput: {
    height: 40,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
