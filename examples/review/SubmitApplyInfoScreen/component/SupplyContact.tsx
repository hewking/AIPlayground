/*
 * @Author: Taro
 * @Date: 2022-12-07 10:20:03
 * @LastEditTime: 2023-06-09 14:05:29
 * @FilePath: /yzw-module/packages/module-recruit/src/screen/SubmitApplyInfoScreen/component/SupplyContact.tsx
 *
 * @LastEditors: Taro
 * @Description: 联系人
 */
import { StyleSheet, Text, View } from "react-native";
import React from "react";
import TextForm from "../../../components/Form";
import { useSubmitApplyInfoScreenState } from "./type";
import { Divider, Palette } from "@nirvana/element";

const formArray = [
  {
    value: "connectUserName",
    title: "姓名",
    required: true,
    textProps: {
      placeholder: "请输入姓名",
      secureTextEntry: false,
      textAlign: "right",
    },
  },
  {
    value: "connectPhone",
    title: "电话",
    required: true,
    textProps: {
      placeholder: "请输入电话",
      secureTextEntry: false,
      maxLength: 11,
      textAlign: "right",
    },
  },
  {
    value: "department",
    title: "部门",
    required: true,
    textProps: {
      placeholder: "请输入所在部门",
      secureTextEntry: false,
      maxLength: 10,
      textAlign: "right",
    },
  },
  {
    value: "post",
    title: "职位",
    required: true,
    textProps: {
      placeholder: "请输入职位",
      maxLength: 10,
      secureTextEntry: false,
      textAlign: "right",
    },
  },
];

export default function SupplyContact() {
  const { getFieldState, control } = useSubmitApplyInfoScreenState();
  return (
    <>
      <Text style={[styles.title]}>
        <Text style={{ color: "red" }}>*&ensp;</Text>联系人
        <Text style={{ fontSize: 12 }}>
          （请填写真实信息，方便采购方与您联系）
        </Text>
      </Text>
      <View style={{ paddingHorizontal: 12, backgroundColor: "#fff" }}>
        {formArray.map((item, index) => (
          <React.Fragment key={index}>
            <TextForm
              getFieldState={getFieldState}
              position="right"
              border={true}
              control={control}
              name={item.value}
              title={item.title}
              textProps={item.textProps}
              required={item.required}
            />
            {index !== formArray.length - 1 ? (
              <Divider
                style={{
                  backgroundColor: Palette.Ribs.Divider,
                }}
              />
            ) : null}
          </React.Fragment>
        ))}
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
