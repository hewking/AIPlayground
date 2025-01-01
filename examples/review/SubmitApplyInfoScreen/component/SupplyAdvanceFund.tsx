/*
 * @Author: Taro
 * @Date: 2022-12-07 10:19:15
 * @LastEditTime: 2023-06-09 17:30:19
 * @FilePath: /yzw-module/packages/module-recruit/src/screen/SubmitApplyInfoScreen/component/SupplyAdvanceFund.tsx
 *
 * @LastEditors: Taro
 * @Description: 垫资
 */
import { StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import React, { useState } from "react";
import { CheckBox, Palette } from "@nirvana/element";
import { useActionSheetModal } from "@nirvana/action-sheet";
import { useSubmitApplyInfoScreenState } from "./type";
import Icon from "@nirvana/ui-icon";

const DURATION_ITEMS = ["每年", "每半年", "每季度", "每月"];

export default function SupplyAdvanceFund() {
  const {
    payInContent,
    setPayInContent,
  } = useSubmitApplyInfoScreenState();

  const [duration, setDuration] = useState(DURATION_ITEMS[0]);

  const {
    renderModal: renderDurationModal,
    show: showDurationSelect,
  } = useActionSheetModal({
    actions: DURATION_ITEMS?.map((item) => {
      return {
        children: item,
        onPress: () => {
          setDuration(item);
        },
      };
    }),
  });

  const regex = /\d+/; // 匹配一个或多个数字
  const payInContentMatch = payInContent.match(regex);

  return (
    <>
      <Text style={[styles.title]}>
        <Text style={{ color: "red" }}>*&ensp;</Text>垫资情况
        <Text style={{ fontSize: 12 }}>
          （采方要求垫资，若不能垫资，无需报名）
        </Text>
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
          <Text>可垫资</Text>
          <Pressable
            onPress={() => {
              showDurationSelect();
            }}
            style={{
              marginLeft: 10,
              padding: 4,
              borderColor: '#eee',
              borderWidth: 1,
              borderRadius: 4,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text>{duration}</Text>
            <Icon
                style={{
                  marginLeft: 4,
                  transform: [
                    {
                      rotate: "90deg",
                    },
                  ],
                }}
                color={Palette.Text.Tip}
                name="icnavigation_arrow_right"
                size={14}
              />
          </Pressable>
          <TextInput
            testID="recruit_submit_apply_info_pay_in_content_input"
            value={payInContentMatch ? payInContentMatch[0] : ''}
            onChangeText={(text) => {
              setPayInContent(`${duration}${text}万元`)
            }}
            placeholderTextColor={Palette.Text.Tip}
            keyboardType={"numeric"}
            placeholder=""
            maxLength={9}
            style={{
              marginLeft: 10,
              flex: 1,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              paddingBottom: 5,
            }}
          />
          <Text style={{
            flex: 0.3,
            textAlign: 'left',
          }}>万元</Text>
        </View>
      </View>
      {renderDurationModal()}
    </>
  );
}

const styles = StyleSheet.create({
  bottomButton: {
    backgroundColor: "#f70",
    marginHorizontal: 15,
    borderRadius: 6,
    marginTop: 15,
  },
  title: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#F5F6F7",
    color: "#9CA0A7",
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
