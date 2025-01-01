/*
 * @Author: Taro
 * @Date: 2022-12-07 10:20:40
 * @LastEditTime: 2023-04-21 16:53:49
 * @FilePath: /yzw-module/packages/module-recruit/src/screen/SubmitApplyInfoScreen/component/SupplayHightLight.tsx
 *
 * @LastEditors: Taro
 * @Description: 企业亮点
 */
import { Platform, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { Palette, TextArea } from "@nirvana/element";
import { useSubmitApplyInfoScreenState } from "./type";
import update from "immutability-helper";

import {
  AlbumDetailModel,
  AssetType,
  GalleryFileType,
  ImageListPicker,
} from "@nirvana/file-picker";
import { isImage, data } from "../utils";

export default function SupplayHightLight() {
  const {
    textAreaVal,
    setTextAreaVal,
    file,
    lastInfo,
    setLastInfo,
    setLocalSupplyAttachment,
  } = useSubmitApplyInfoScreenState();
  const maxFileSize = 20 * 1024;
  const [fileList, setFileList] = React.useState<any[]>([]);
  useEffect(() => {
    if (lastInfo && lastInfo.applyAttachments.length > 0) {
      setFileList(
        lastInfo.applyAttachments.map((item: any) => {
          //截取filename后缀
          let fileType: GalleryFileType;
          const suffix = item.fileName.substring(
            item.fileName.lastIndexOf(".") + 1
          );
          if (isImage(suffix)) {
            fileType = GalleryFileType.image;
          } else if (suffix === "docx" || suffix === "doc") {
            fileType = GalleryFileType.doc;
          } else if (suffix === "xlsx" || suffix === "xls") {
            fileType = GalleryFileType.xls;
          } else if (suffix === "pptx" || suffix === "ppt") {
            fileType = GalleryFileType.ppt;
          } else if (suffix === "pdf") {
            fileType = GalleryFileType.pdf;
          } else if (suffix === "txt") {
            fileType = GalleryFileType.text;
          } else {
            fileType = suffix;
          }
          return {
            ...item,
            url: item.fileUrl,
            filename: item.fileName,
            type: fileType,
          };
        })
      );
    }
  }, [lastInfo?.applyAttachments]);

  const localAttachment = useMemo(() => {
    return file.props.dataSource?.find((its) => its.supplyType === "supply");
  }, [file.props.dataSource]);
  return (
    <>
      <Text style={[styles.title]}>
        相关附件
        <Text style={{ fontSize: 12 }}>
          （选填，请上传近3年历史业绩、相关企业资质文件等）
        </Text>
      </Text>
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
          dataSource={
            fileList.length > 0
              ? fileList
              : localAttachment
              ? [localAttachment]
              : []
          }
          onDelete={(val, i) => {
            let index = file.props.dataSource.findIndex(
              (item) => item.supplyType === "supply"
            );
            if (index > -1) {
              file.props.onDelete(val, index);
            }
            setFileList([]);
            lastInfo &&
              setLastInfo({
                ...lastInfo,
                applyAttachments: [],
              });
          }}
          onAdd={(val) => {
            file.setImageList((pre) => {
              return update(pre, {
                $push: [
                  {
                    ...val,
                    supplyType: "supply",
                  },
                ],
              });
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
      <Text style={[styles.title]}>
        企业亮点
        <Text style={{ fontSize: 12 }}>
          （可填写企业的规模/业绩/荣誉、售后服务等）
        </Text>
      </Text>
      <TextArea
        value={textAreaVal}
        onChangeValue={function (value: string): void {
          setTextAreaVal(value);
        }}
        placeholder="填写企业的规模/业绩/荣誉、售后服务等信息"
        placeholderTextColor={Palette.Text.Tip}
        style={{ backgroundColor: "#fff" }}
        maxLength={150}
      />
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
