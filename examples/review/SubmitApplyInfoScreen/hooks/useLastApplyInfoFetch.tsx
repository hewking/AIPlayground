/*
 * @Author: Taro
 * @Date: 2022-12-07 15:20:46
 * @LastEditTime: 2023-01-12 10:08:25
 * @FilePath: /module-recruite/src/screen/SubmitApplyInfoScreen/hooks/useLastApplyInfoFetch.tsx
 *
 * @LastEditors: Taro
 * @Description:
 */

import { useHttpClient } from "@nirvana/net";

const useLastApplyInfo = () => {
  const bindGetLastApplyInfo = useHttpClient({
    method: "get",
    url: `/mer/sup/recruit/getLastlyApplyContactInfo`,
    name: "yzmt",
  });
  const getLastApplyInfo = async () => {
    try {
      let { data } = await bindGetLastApplyInfo();
      if (data.success) {
        return data.data;
      } else {
        return {};
      }
    } catch (error) {
      return {};
    }
  };
  return { getLastApplyInfo };
};

export default useLastApplyInfo;
