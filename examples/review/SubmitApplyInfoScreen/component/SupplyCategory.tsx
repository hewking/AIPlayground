/*
 * @Author: Taro
 * @Date: 2022-12-07 10:17:30
 * @LastEditTime: 2023-06-09 10:58:08
 * @FilePath: /yzw-module/packages/module-recruit/src/screen/SubmitApplyInfoScreen/component/SupplyCategory.tsx
 *
 * @LastEditors: Taro
 * @Description: 供应品类
 */
import { Platform, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useSubmitApplyInfoScreenState } from "./type";
import { Toast } from "@nirvana/toast";
import _ from "lodash";
import RecruitTable from "../../RecruitInfoScreen/component/RecruitTable";
import update from "immutability-helper";
import useChooseBrandModal from "../hooks/useChooseBrandModal";

import { GalleryFileType, ImageListPicker } from "@nirvana/file-picker";

const brandReg = /[,，、；。/]/;

export default function SupplyCategory() {
  const {
    file,
    recruitInfo,
    selectMaterialName,
    recruitCategoryVOList,
    setSelectMaterialName,
    setLastInfo,
  } = useSubmitApplyInfoScreenState();
  const isSupplierQuotation =
    recruitInfo?.recruitVO?.isSupplierQuotation || false;
  const maxFileSize = 20 * 1024;

  const {show: showChooseBrand, renderChooseBrand} = useChooseBrandModal();

  const selectItem = (text: string, record: any, index: number) => {
    // 如果是材料类型，则展示选择品牌二次弹窗
    const brand = record.brand;
    const isChecked = selectMaterialName.map(e => e.recruitCategoryCode).includes(record?.code);

    const next = (supportBrands: string[]) => {
      if (isChecked) {
        setSelectMaterialName(
          selectMaterialName.filter((i) => i.recruitCategoryCode !== record?.code)
        );
        return;
      }
      setSelectMaterialName([...selectMaterialName, {recruitCategoryCode: record?.code, supplyBrand: supportBrands.join(',')}]);
    };

    if (isMaterialCs && brand && brand !== "-" && !isChecked) {
      const brands = brand?.split(brandReg).filter(v => !!v);
      showChooseBrand({
        items: brands,
        materialName: record?.materialName,
        onComfirm: (selected: any[]) => {
          next(selected.filter(e => e.checked).map(e => e.title));
        }
      });
      return;
    }
    next([]);
  };
  const localAttachment = useMemo(() => {
    return file.props.dataSource?.find((its) => its.supplyType === "quotation");
  }, [file.props.dataSource]);

  const type = recruitInfo?.recruitVO?.categoryType;
  const isMaterialCs = type === 0 || type === 3 || type === 4;

  return (
    <>
      <Text style={[styles.title, { marginTop: 10, color: "#666" }]}>
        根据您能提供的
        {recruitInfo?.recruitVO?.categoryType === 0 ? "供应品类" : "分包内容"}
        进行勾选，可多选
      </Text>
      <View style={{ backgroundColor: "#fff", padding: 12, paddingTop: 0 }}>
        <RecruitTable
          select={selectMaterialName.map(e => e.recruitCategoryCode)}
          onExtra={selectItem}
          source="supply"
          data={recruitCategoryVOList}
          type={type}
        />
      </View>
      {isSupplierQuotation && (
        <>
          <View style={{ backgroundColor: "rgb(245, 246, 247)" }}>
            <Text style={[styles.title, { marginTop: 10, color: "#666" }]}>
              <Text style={{ color: "red" }}>*</Text>
              报价单
              <Text style={{ fontSize: 12 }}>
                （采方要求供方报价，请上传供应品类报价单，需盖章）
              </Text>
            </Text>
          </View>
          <View
            style={{
              padding: 10,
              paddingBottom: Platform.OS === "web" ? 0 : 10,
              backgroundColor: "#fff",
            }}
          >
            {/* 支持word、pdf、ppt、jpg、png、excel等格式，最多上传1个附件 */}
            <ImageListPicker
              {...file.props}
              maxUploadNum={1}
              dataSource={localAttachment ? [localAttachment] : []}
              onAdd={(val) => {
                file.setImageList((pre) => {
                  return update(pre, {
                    $push: [
                      {
                        ...val,
                        supplyType: "quotation",
                      },
                    ],
                  });
                });
              }}
              onDelete={(val, i) => {
                file.props.onDelete(val, i);
                setLastInfo((pre) => {
                  return {
                    ...pre,
                    quotationAttachments: [],
                  };
                });
              }}
              fileMaxSize={maxFileSize}
              allowDelete
              filterFileTypes={[
                GalleryFileType.other,
                GalleryFileType.image,
                GalleryFileType.photo,
                GalleryFileType.video,
                GalleryFileType.audio,
                GalleryFileType.text,
                GalleryFileType.doc,
                GalleryFileType.pdf,
                GalleryFileType.ppt,
                GalleryFileType.xls,
                GalleryFileType.zip,
                GalleryFileType.unknown,
              ]}
              withFile="with"
            />
          </View>
        </>
      )}
      {renderChooseBrand()}
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
  formItem: {
    flexDirection: "row",
    height: 40,
    alignItems: "center",
    backgroundColor: "#F5F6F7",
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  formItems: {
    flexDirection: "row",
    height: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    justifyContent: "space-between",
    flex: 1,
  },
  center: {
    flex: 1,
  },
});
