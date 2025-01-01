/*
 * @Author: Taro
 * @Date: 2023-02-06 17:22:42
 * @LastEditTime: 2023-07-13 17:02:47
 * @FilePath: /yzw-module/packages/module-recruit/src/screen/SubmitApplyInfoScreen/hooks/useSubmitApplyInfoScreen.ts
 *
 * @LastEditors: Taro
 * @Description:
 */
import { Toast } from "@nirvana/toast";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  DeviceEventEmitter,
  Keyboard,
  LayoutAnimation,
  Platform,
} from "react-native";
import useFile from "../../../hooks/useFile";
import { RouterNames } from "../../../routers/routeName";
import { LastlyApplyContactInfo } from "../../RecruitInfoScreen/component/untils";
import useRecruitInfoHttpResult from "../../RecruitInfoScreen/hooks/useRecruitInfoHttpResult";
import { areaType } from "../component/type";
import {
  ApplyAttachment,
  RecruitInfo,
  localSupplyAttachmentType,
} from "../utils";
import useCountdown from "./useCountDown";
import useFileService from "../../../hooks/useFssFileService";

export const smsCodeTime = 60;
export const useSubmitApplyInfoScreen = (props: {
  recruitCode: string;
  recruitInfo: RecruitInfo;
  lastApplyInfo: LastlyApplyContactInfo;
}) => {
  const { recruitCode, recruitInfo, lastApplyInfo } = props;
  const [lastInfo, setLastInfo] = useState<LastlyApplyContactInfo>(
    lastApplyInfo
  );
  const { getFileFullUrl } = useFileService();
  const [Areas, setAreas] = useState<areaType>(new Array());
  const [selectAreas, setselectAreas] = useState(new Array());
  const [isSelectAll, setisSelectAll] = useState(false);
  const { confirmToApply } = useRecruitInfoHttpResult({
    recruitCode,
  });
  const recruitCategoryVOList = recruitInfo?.recruitCategoryVOList;
  const [selectMaterialName, setSelectMaterialName] = useState<
    { recruitCategoryCode: string; supplyBrand?: string }[]
  >([]);
  const [selectPadFunded, setSelectPadFunded] = useState<boolean>(true);
  const [selectApplyDeadline, setSelectApplyDeadline] = useState<boolean>(true);
  const [textAreaVal, setTextAreaVal] = useState<string>("");
  const [payInContent, setPayInContent] = useState<string>("");
  const [accountPeriodContent, setAccountPeriodContent] = useState<string>("");
  const [modalVerifyTips, setModalVerifyTips] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const [current, setCurrent] = useState(0);
  const file = useFile();
  const { start, stop, time } = useCountdown(smsCodeTime);
  const [submitParams, setSubmitParams] = useState();
  const [
    localSupplyAttachment,
    setLocalSupplyAttachment,
  ] = useState<localSupplyAttachmentType>({} as localSupplyAttachmentType);
  const { handleSubmit, control, getFieldState, reset, getValues } = useForm({
    defaultValues: {
      connectUserName: lastInfo?.connectUserName || "",
      connectPhone: lastInfo?.connectPhone || "",
      department: lastInfo?.department || "",
      post: lastInfo?.position || "",
    },
  });
  //拼接数组
  useEffect(() => {
    let list = new Array();
    recruitInfo?.areaNames.forEach((item, index) => {
      list.push({
        areaName: item,
        areaCode: recruitInfo?.areaCodes[index],
        isSelect: false,
      });
    });
    setAreas(list);
    lastInfo && setTextAreaVal(lastInfo?.enterpriseHighlights);
    return () => {
      setisSelectAll(false);
      setselectAreas([]);
      reset({
        department: "",
        post: "",
      });
    };
  }, [recruitInfo]);

  const submit = async (data: any) => {
    Keyboard.dismiss();
    verifySubmit(data);
  };

  const haveDznl = recruitInfo?.recruitConditionDetailVOList?.some(
    (v) => v.conditionCode === "DZNL"
  );

  //通过校验调用报名接口
  const verifySubmit = async (data: {
    department: any;
    post: any;
    connectPhone: any;
    connectUserName: any;
  }) => {
    let recruitCategoryCodeList = new Array();
    let selectAreaArray = new Array();
    let applyAttachments = new Array();
    let quotationAttachments = new Array();
    //附件,需要从file.fileOrgData中找到与file.props.dataSource中title与filename相同的数据
    file.fileOrgData.forEach((item) => {
      file.props.dataSource.forEach((i) => {
        //报名附件
        if (item.title === i.filename && i.supplyType === "supply") {
          applyAttachments.push({
            ossKey: item.filePath,
            url: item.fileFullPath,
            fileName: item.original,
          });
        }
        //其他附件
        if (item.title === i.filename && i.supplyType === "quotation") {
          quotationAttachments.push({
            ossKey: item.filePath,
            url: item.fileFullPath,
            fileName: item.original,
          });
        }
      });
    });

    if (
      lastInfo &&
      applyAttachments.length === 0 &&
      lastInfo.applyAttachments.length > 0
    ) {
      applyAttachments = lastInfo?.applyAttachments;
    }

    //区域
    selectAreas.forEach((i) => {
      if (i.isSelect) {
        selectAreaArray.push(i.areaCode);
      }
    });

    recruitCategoryCodeList = selectMaterialName;
    let params: any = {
      areaCodes: selectAreaArray,
      connectPhone: data.connectPhone,
      connectUserName: data.connectUserName,
      acceptAccountPeriod: selectApplyDeadline,
      // acceptPayIn: selectPadFunded,
      recruitCode,
      position: data.post,
      department: data.department,
      status: null,
      enterpriseHighlights: textAreaVal,
      recruitApplyCategoryList: recruitCategoryCodeList,
      categoryCodes: recruitCategoryCodeList.map((e) => e.recruitCategoryCode),
      applyAttachments,
      quotationAttachments,
      source: Platform.OS === "web" ? 0 : 3,
    };
    // 垫资情况
    if (payInContent) {
      params.payInContent = payInContent;
    }
    // if (selectApplyDeadline) {
    //   params.accountPeriodContent = accountPeriodContent;
    // }
    submitFinish(params);
    setSubmitParams(params);
  };
  const submitFinish = async (data) => {
    setLoading(true);
    let res = await confirmToApply(data);
    setLoading(false);
    if (res.success) {
      DeviceEventEmitter.emit("applySuccess");
      //@ts-ignore
      navigation.push(RouterNames.ApplyResultDetailScreen, {
        recruitCode: recruitInfo?.recruitVO?.code,
        success: true,
      });
      setModalVerifyTips(false);
    } else {
      if (res.type === "message") {
        setModalVerifyTips(true);
      }
    }
  };
  const submitOrNext = (data) => {
    let reg = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/;

    if (current === 3) {
      if (data.connectUserName === "") {
        return Toast.fail("姓名不能为空");
      }
      if (data.connectPhone === "") {
        if (!reg.test(data.connectPhone)) {
          return Toast.fail("请输入正确的手机号");
        }
        return Toast.fail("电话不能为空");
      }
      if (data.department === "") {
        return Toast.fail("部门不能为空");
      }
      if (data.post === "") {
        return Toast.fail("职位不能为空");
      }

      submit(data);
      return;
    }
    if (current === 0) {
      if (selectMaterialName.length === 0) {
        return Toast.fail("请至少选择一种供应品类或分包内容");
      }
      if (recruitInfo.recruitVO.isSupplierQuotation) {
        let quotationAttachment: any[] = [];
        file.props.dataSource.forEach((item) => {
          if (item.supplyType === "quotation") {
            quotationAttachment.push(item);
          }
        });
        if (
          file.props.dataSource.length === 0 ||
          quotationAttachment.length === 0
        ) {
          return Toast.fail("请上传报价单");
        }
      }
    }
    if (current === 1) {
      if (selectAreas.length === 0) {
        return Toast.fail("请至少选择一个区域");
      }
    }
    if (current === 2) {
      if (haveDznl && payInContent === "") {
        return Toast.fail("请填写垫资内容");
      }
    }

    setCurrent(current + 1);
    LayoutAnimation.configureNext(
      LayoutAnimation.create(300, "easeInEaseOut", "opacity")
    );
  };
  //上一步
  const preStep = () => {
    current === 0 ? navigation.goBack() : setCurrent(current - 1);
  };
  return {
    Areas,
    file,
    recruitInfo,
    recruitCategoryVOList,
    selectMaterialName,
    selectPadFunded,
    selectAreas,
    isSelectAll,
    selectApplyDeadline,
    control,
    textAreaVal,
    payInContent,
    accountPeriodContent,
    current,
    loading,
    lastInfo,
    modalVerifyTips,
    submitParams,
    localSupplyAttachment,
    haveDznl,
    setLocalSupplyAttachment,
    submitFinish,
    setSubmitParams,
    time,
    start,
    stop,
    setModalVerifyTips,
    setLastInfo,
    preStep,
    handleSubmit,
    submitOrNext,
    setLoading,
    submit,
    setAccountPeriodContent,
    setPayInContent,
    setSelectMaterialName,
    getFieldState,
    getValues,
    setAreas,
    setselectAreas,
    setisSelectAll,
    setSelectPadFunded,
    setSelectApplyDeadline,
    setTextAreaVal,
    setCurrent,
  };
};
