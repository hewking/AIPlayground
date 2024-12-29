/*
 * @Author: Taro
 * @Date: 2022-12-07 10:23:19
 * @LastEditTime: 2023-03-24 10:51:22
 * @FilePath: /modules-recruit/src/screen/SubmitApplyInfoScreen/component/type.ts
 *
 * @LastEditors: Taro
 * @Description:
 */

import React from "react";
import {
  Control,
  UseFormGetFieldState,
  UseFormGetValues,
} from "react-hook-form";
import { fileType } from "../../../hooks/useFile";
import { LastlyApplyContactInfo } from "../../RecruitInfoScreen/component/untils";
import {
  RecruitCategoryVOList,
  RecruitInfo,
  localSupplyAttachmentType,
} from "../utils";

export type areaType = {
  areaName: string;
  areaCode: string;
  isSelect: boolean;
}[];
export type SubmitApplyInfoScreenContextType = {
  Areas: areaType;
  recruitInfo: RecruitInfo;
  file: fileType;
  lastInfo: LastlyApplyContactInfo;
  recruitCategoryVOList: RecruitCategoryVOList[];
  selectMaterialName: {recruitCategoryCode: string, supplyBrand?: string}[];
  selectPadFunded: boolean;
  selectAreas: any[];
  isSelectAll: boolean;
  selectApplyDeadline: boolean;
  control: Control<
    {
      connectUserName: string;
      connectPhone: string;
      department: string;
      post: string;
    },
    any
  >;
  time: {
    day: string | number;
    hour: string | number;
    minute: string | number;
    second: string | number;
  };
  start: () => void;
  stop: () => void;
  textAreaVal: string;
  payInContent: string;
  accountPeriodContent: string;
  submitParams: any;
  submitFinish: (e) => void;
  setSubmitParams: React.Dispatch<React.SetStateAction<any>>;
  setAccountPeriodContent: React.Dispatch<React.SetStateAction<string>>;
  setPayInContent: React.Dispatch<React.SetStateAction<string>>;
  setSelectMaterialName: React.Dispatch<React.SetStateAction<{recruitCategoryCode: string, supplyBrand?: string}[]>>;
  getFieldState: UseFormGetFieldState<{
    connectUserName: string;
    connectPhone: string;
    department: string;
    post: string;
  }>;
  getValues: UseFormGetValues<{
    connectUserName: string;
    connectPhone: string;
    department: string;
    post: string;
  }>;
  setAreas: React.Dispatch<React.SetStateAction<areaType>>;
  setselectAreas: React.Dispatch<React.SetStateAction<any[]>>;
  setisSelectAll: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectPadFunded: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectApplyDeadline: React.Dispatch<React.SetStateAction<boolean>>;
  setTextAreaVal: React.Dispatch<React.SetStateAction<string>>;
  setLastInfo: React.Dispatch<React.SetStateAction<LastlyApplyContactInfo>>;
  modalVerifyTips: boolean;
  setModalVerifyTips: React.Dispatch<React.SetStateAction<boolean>>;
  localSupplyAttachment: localSupplyAttachmentType;
  setLocalSupplyAttachment: React.Dispatch<
    React.SetStateAction<localSupplyAttachmentType>
  >;
};
export const SubmitApplyInfoScreenContext = React.createContext(
  {} as SubmitApplyInfoScreenContextType
);
export const useSubmitApplyInfoScreenState = () =>
  React.useContext(SubmitApplyInfoScreenContext);
