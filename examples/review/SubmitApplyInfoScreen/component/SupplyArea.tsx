/*
 * @Author: Taro
 * @Date: 2022-12-07 10:18:29
 * @LastEditTime: 2023-06-09 17:29:15
 * @FilePath: /yzw-module/packages/module-recruit/src/screen/SubmitApplyInfoScreen/component/SupplyArea.tsx
 *
 * @LastEditors: Taro
 * @Description: 地区
 */
import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { Cell, CheckBox, Divider } from "@nirvana/element";
import { useSubmitApplyInfoScreenState } from "./type";

export default function SupplyArea() {
  const {
    Areas,
    selectAreas,
    isSelectAll,
    setisSelectAll,
    setAreas,
    setselectAreas,
  } = useSubmitApplyInfoScreenState();

  useEffect(() => {
    if (selectAreas.length != 0) {
      if (selectAreas.length === Areas.length) {
        setisSelectAll(true);
        return;
      }
      setisSelectAll(false);
    }
  }, [selectAreas]);

  //单选
  const selectArea = (it: {
    areaName: any;
    areaCode?: string;
    isSelect?: boolean;
  }) => {
    let areaList = [...Areas];
    let selectAreaList = new Array();
    areaList.forEach((item) => {
      if (item.areaName === it.areaName) {
        it.isSelect = !item.isSelect;
      }
    });
    areaList.forEach((element) => {
      if (element.isSelect) {
        selectAreaList.push(element);
      }
    });
    setAreas(areaList);
    setselectAreas(selectAreaList);
  };
  //全选
  const selectAll = () => {
    let arry = [...Areas];
    if (Areas.length === selectAreas.length) {
      arry.forEach((item) => {
        item.isSelect = false;
      });
      setAreas(arry);
      setselectAreas([]);
    } else {
      arry.forEach((item) => {
        item.isSelect = true;
      });
      setAreas(arry);
      setselectAreas(Areas);
    }
  };
  return (
    <>
      <Text style={[styles.title, { marginTop: 10, color: "#666" }]}>
        根据您可供应的区域进行选择，可多选
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingRight: 24,
          backgroundColor: "#F5F6F7",
        }}
      >
        <Text
          style={[
            styles.title,
            { backgroundColor: "#F5F6F7", color: "#9CA0A7", marginLeft: 12 },
          ]}
        >
          区域
        </Text>
        <Pressable
          testID="recruit_submit_apply_info_screen_supply_area_select_all"
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => {
            selectAll();
            setisSelectAll(!isSelectAll);
          }}
        >
          <Text style={{ marginRight: 5, color: "#9CA0A7" }}>勾选</Text>
          <CheckBox
            iconCheckedColor={"#f70"}
            checked={Areas.length === selectAreas.length && isSelectAll}
            onChange={(e) => {
              selectAll();
              setisSelectAll(e);
            }}
          />
        </Pressable>
      </View>
      {Areas.map((item, index) => {
        return (
          <View
            key={index}
            style={{ paddingHorizontal: 12, backgroundColor: "#fff" }}
          >
            <Cell
              title={item.areaName}
              value={
                <CheckBox
                  iconCheckedColor={"#f70"}
                  checked={item.isSelect}
                  onChange={(e) => {
                    selectArea(item);
                  }}
                />
              }
            />
            {index != Areas.length - 1 && <Divider />}
          </View>
        );
      })}
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
    fontSize: 15,
    paddingVertical: 10,
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
