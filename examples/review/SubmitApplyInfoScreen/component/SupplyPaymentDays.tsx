/*
 * @Author: Taro
 * @Date: 2022-12-07 10:19:42
 * @LastEditTime: 2023-06-09 17:31:07
 * @FilePath: /yzw-module/packages/module-recruit/src/screen/SubmitApplyInfoScreen/component/SupplyPaymentDays.tsx
 *
 * @LastEditors: Taro
 * @Description: 账期
 */
import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import { useSubmitApplyInfoScreenState } from "./type";
import { CheckBox, Palette } from "@nirvana/element";

export default function SupplyPaymentDays() {
  const {
    selectApplyDeadline,
    setSelectApplyDeadline,
    accountPeriodContent,
    setAccountPeriodContent,
  } = useSubmitApplyInfoScreenState();
  return (
    <>
      <Text style={[styles.title]}>
        <Text style={{ color: "red" }}>*&ensp;</Text>是否接受账期
        <Text style={{ fontSize: 12 }}>（根据您是否接受账期进行选择）</Text>
      </Text>
      <View
        style={{
          backgroundColor: "#fff",
          paddingBottom: 10,
          paddingHorizontal: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 12,
          }}
        >
          <CheckBox
            style={{ marginRight: 5 }}
            checked={selectApplyDeadline}
            iconCheckedColor={"#f70"}
            onChange={() => {
              if (selectApplyDeadline) return;
              setSelectApplyDeadline(!selectApplyDeadline);
            }}
          />
          <Text style={{ flex: 0.3 }}>接受账期</Text>
          <>
            {selectApplyDeadline && (
              <TextInput
                testID="recruit_submit_apply_info_account_period_content_input"
                value={accountPeriodContent}
                onChangeText={(text) => {
                  setAccountPeriodContent(text);
                }}
                maxLength={10}
                placeholderTextColor={Palette.Text.Tip}
                placeholder="举例：月结/70%，请根据实际情况填写"
                style={{
                  marginLeft: 10,
                  flex: 1,
                  borderBottomWidth: 1,
                  borderBottomColor: "#eee",
                  paddingBottom: 5,
                }}
              />
            )}
          </>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <CheckBox
            style={{ marginRight: 5 }}
            checked={!selectApplyDeadline}
            onChange={() => {
              if (!selectApplyDeadline) return;
              setSelectApplyDeadline(!selectApplyDeadline);
            }}
            iconCheckedColor={"#f70"}
          />
          <Text style={{ flex: 1 }}>不接受账期</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F5F6F7",
    color: "#9CA0A7",
  },
});
