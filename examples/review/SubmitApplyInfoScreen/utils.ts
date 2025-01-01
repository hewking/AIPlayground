/*
 * @Author: Taro
 * @Date: 2023-01-12 10:02:16
 * @LastEditTime: 2023-09-26 15:31:29
 * @FilePath: /yzw-module/packages/module-recruit/src/screen/SubmitApplyInfoScreen/utils.ts
 *
 * @LastEditors: Please set LastEditors
 * @Description:
 */

//判断是否是图片
export const isImage = (type: string) => {
  return (
    type === "jpg" ||
    type === "jpeg" ||
    type === "png" ||
    type === "gif" ||
    type === "bmp" ||
    type === "webp"
  );
};

export interface ContactInfoList {
  code: string;
  contactName: string;
  contactPhone: string;
  recruitCode: string;
  todayRemainCallingTimes: number;
}

export interface ApplyAttachment {
  fileName: string;
  fileUrl: string;
  ossKey: string;
}

export interface RecruitApply {
  acceptAccountPeriod: number;
  acceptPayIn: number;
  accountPeriodContent: string;
  applyAttachments: ApplyAttachment[];
  quotationAttachments: ApplyAttachment[];
  applyTime: string;
  areaCodeLists: any[];
  areaNameLists: string[];
  auditContent: string;
  auditStatus: number;
  categoryCodeLists: any[];
  categoryNameLists: any[];
  code: string;
  companyId: string;
  connectPhone: string;
  connectUserName: string;
  department: string;
  enterpriseHighlights: string;
  materialNameList: string[];
  payInContent: string;
  position: string;
  source: number;
  status: number;
}

export interface RecruitCategoryVOList {
  brand: string;
  budget: number;
  categoryCode: string;
  code: string;
  createUserId: string;
  materialName: string;
  num: number;
  recruitCode: string;
  standards: string;
  unitName: string;
  labour: number;
  teamNum: number;
}

export interface RecruitConditionDetailVOList {
  code: string;
  conditionCode: string;
  conditionValue: string;
  createUserId: string;
  recruitCode: string;
}

export interface RecruitVO {
  followArrange: string;
  applyDeadline: string;
  availableCallCount: number;
  categoryType: number;
  code: string;
  companyId: string;
  companyName: string;
  createTime: string;
  createUserId: string;
  isMeeting: number;
  isShowUserNum: boolean;
  name: string;
  produceCompanyName: string;
  produceUserId: string;
  produceUserName: string;
  produceUserNum: string;
  publishTime: string;
  status: number;
  type: number;
  isSupplierQuotation: boolean;
}

export interface Project {
  address: string;
  code: string;
  contractCost: string;
  contractScale: string;
  contractScope: string;
  duration: string;
  durationProgress: string;
  name: string;
  paymentTerms: string;
}

/**
 * 会议相关信息
 *
 * 招募会议信息
 */
export interface AboutRecruit {
  /**
   * 标讯记录表CODE
   */
  code?: string;
  /**
   * 招标单位
   */
  companyName?: string;
  /**
   * 数据来源 1.集采 2.招采
   */
  dataSourceType?: number;
  /**
   * 招标编号
   */
  tenderCode?: string;
  /**
   * 标讯ID
   */
  tenderId?: number;
  /**
   * 标讯名称
   */
  tenderName?: string;
}

export interface RecruitInfo {
  recruitMeetingVO: any;
  areaCodes: string[];
  areaNames: string[];
  attachments: any[];
  contactInfoList: ContactInfoList[];
  hasApplied: boolean;
  recruitApply: RecruitApply;
  recruitCategoryVOList: RecruitCategoryVOList[];
  recruitConditionDetailVOList: RecruitConditionDetailVOList[];
  recruitCustomizeConditions: any[];
  recruitTenders: AboutRecruit[];
  recruitVO: RecruitVO;
  viewTimeList: any[];
  project: Project;
  projectList: Project[];
}
export interface localSupplyAttachmentType {
  applyAttachments: Array<any>;
  quotationAttachments: Array<any>;
}
export const data = {
  code: "1625440539153293320",
  inviteCode: "1625440728148635740",
  recruitCode: "1625440539153293320",
  recruitInfo: {
    areaCodes: [
      "110000",
      "120000",
      "130000",
      "140000",
      "150000",
      "210000",
      "220000",
      "230000",
      "310000",
      "320000",
      "330000",
      "340000",
      "350000",
      "360000",
      "370000",
      "410000",
      "420000",
      "430000",
      "440000",
      "450000",
      "460000",
      "500000",
      "510000",
      "520000",
      "530000",
      "540000",
      "610000",
      "620000",
      "630000",
      "640000",
      "650000",
      "lyx0601",
      "lyx060118",
    ],
    areaNames: [
      "北京市",
      "天津市",
      "河北省",
      "山西省",
      "内蒙古自治区",
      "辽宁省",
      "吉林省",
      "黑龙江省",
      "上海市",
      "江苏省",
      "浙江省",
      "安徽省",
      "福建省",
      "江西省",
      "山东省",
      "河南省",
      "湖北省",
      "湖南省",
      "广东省",
      "广西壮族自治区",
      "海南省",
      "重庆市",
      "四川省",
      "贵州省",
      "云南省",
      "西藏自治区",
      "陕西省",
      "甘肃省",
      "青海省",
      "宁夏回族自治区",
      "新疆维吾尔自治区",
      "测试0601",
      "测试lyx0601",
    ],
    attachments: [],
    contactInfoList: [
      {
        code: "1625440539795021853",
        contactName: "c经理",
        contactPhone: "18280431128",
        isInViewTime: false,
        recruitCode: "1625440539153293320",
        todayRemainCallingTimes: 100,
      },
    ],
    hasApplied: false,
    recruitCategoryVOList: [
      {
        brand: "",
        budget: 100,
        categoryCode: "",
        code: "1625440539526586466",
        createUserId: "10338002",
        labour: 1000,
        materialName: "地坪",
        recruitCode: "1625440539153293320",
        standards: "",
        teamNum: 10,
        unitName: "",
      },
      {
        brand: "",
        budget: 100,
        categoryCode: "",
        code: "1625440539539169304",
        createUserId: "10338002",
        labour: 1000,
        materialName: "楼梯",
        recruitCode: "1625440539153293320",
        standards: "",
        teamNum: 10,
        unitName: "",
      },
    ],
    recruitConditionDetailVOList: [
      {
        code: "1625440539585310752",
        conditionCode: "ZCZJ",
        conditionValue: "1.00",
        createUserId: "10338002",
        recruitCode: "1625440539153293320",
      },
      {
        code: "1625440539593699351",
        conditionCode: "QYZZ",
        conditionDetailMapping: {
          conditionCode: "QYZS",
        },
        conditionValue: '["QYZS"]',
        createUserId: "10338002",
        recruitCode: "1625440539153293320",
      },
      {
        code: "1625440539597889552",
        conditionCode: "DZNL",
        conditionValue: "",
        createUserId: "10338002",
        recruitCode: "1625440539153293320",
      },
      {
        code: "1625440539606278188",
        conditionCode: "GCYJ",
        conditionValue: "",
        createUserId: "10338002",
        recruitCode: "1625440539153293320",
      },
      {
        code: "1625440539623059471",
        conditionCode: "QYXZ",
        conditionValue: "[1,2,3]",
        createUserId: "10338002",
        recruitCode: "1625440539153293320",
      },
    ],
    recruitCustomizeConditions: [],
    recruitTenders: [],
    recruitVO: {
      applyDeadline: "2023-02-28 18:22:56",
      availableCallCount: 25,
      categoryType: 1,
      code: "1625440539153293320",
      companyId: "50008086",
      companyName: "中国建筑股份有限公司",
      createTime: "2023-02-14 18:23:18",
      createUserId: "10338002",
      isMeeting: 0,
      isShowUserNum: true,
      name: "诚挚招募地坪、楼梯供应商",
      produceCompanyName: "中国建筑股份有限公司",
      produceUserId: "10338002",
      produceUserName: "c经理",
      produceUserNum: "18280431128",
      publishTime: "2023-02-14 18:24:33",
      status: 2,
      type: 1,
    },
    viewTimeList: [
      {
        code: "1625672689018499103",
        endTime: "11:30",
        startTime: "09:30",
      },
      {
        code: "1625672689026887769",
        endTime: "17:00",
        startTime: "13:30",
      },
    ],
  },
  lastInfo: {
    acceptAccountPeriod: 0,
    acceptPayIn: 0,
    accountPeriodContent: "",
    applyAttachments: [
      {
        fileName:
          "中建电商法字〔2022〕38号 关于印发《中建电子商务有限责任公司员工违规违纪处理办法实施细则》的通知.pdf",
        fileUrl:
          "https://iec-xy.oss-cn-beijing.aliyuncs.com/xy/qa/BE7791C93BD066C18B3C1953C2228F21?Expires=1677577229&OSSAccessKeyId=LTAI5tFweR7WaHyZP2eh4Mwk&Signature=k%2Bd8qX2%2FLoSFK37V8D1qEz1cc%2Bo%3D",
        ossKey: "BE7791C93BD066C18B3C1953C2228F21",
      },
    ],
    applyTime: "2023-02-15 17:38:12",
    areaCodeLists: [],
    areaNameLists: [],
    auditContent: "审核不通过测试",
    auditStatus: 2,
    categoryCodeLists: [],
    categoryNameLists: [],
    code: "1625791576787681347",
    companyId: "216176",
    connectPhone: "13566666666",
    connectUserName: "林岚",
    department: "研发",
    enterpriseHighlights: "排名靠前BBBBBBBB",
    materialNameList: [],
    payInContent: "",
    position: "主管",
    source: 1,
    status: 20,
  },
};
