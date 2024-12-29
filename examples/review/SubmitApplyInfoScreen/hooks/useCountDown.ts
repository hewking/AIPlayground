/*
 * @Author: Taro
 * @Date: 2023-03-01 10:27:21
 * @LastEditTime: 2023-03-01 10:27:22
 * @FilePath: /modules-recruit/src/screen/SubmitApplyInfoScreen/hooks/useCountDown.ts
 * 
 * @LastEditors: Taro
 * @Description: 
 */

import { AppState } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function add(date: Date, seconds: number) {
  return new Date(date.getTime() + seconds * 1000);
}
function diff(now: Date, target: Date) {
  return Math.max(
    Math.trunc((target.getTime() - now.getTime()) / 1000 + 0.5),
    0
  );
}

export default function useCountdown(seconds = 30) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [target, setTarget] = useState<Date | null>(null);
  const [count, setCount] = useState<number>(0);
  const appState = useRef(AppState.currentState);

  const start = useCallback(() => {
    setTarget(add(new Date(), seconds));
  }, [seconds]);
  const stop = useCallback(() => {
    setTarget(null);
    setCount(0);
  }, []);

  useEffect(() => {
    if (target === null || appState.current !== "active") {
      return;
    }
    setCount(diff(new Date(), target));
    timer.current = setInterval(() => {
      setCount(diff(new Date(), target));
    }, 1000);
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [target, appState]);
  useEffect(() => {
    if (count === 0) {
      stop();
    }
  }, [count, stop]);
  //通过count转换成天时分秒
  const time = useMemo(() => {
    const day = Math.floor(count / 86400);
    const hour = Math.floor((count % 86400) / 3600);
    const minute = Math.floor(((count % 86400) % 3600) / 60);
    const second = Math.floor(((count % 86400) % 3600) % 60);
    return {
      day,
      hour: hour < 10 ? `0${hour}` : hour,
      minute: minute < 10 ? `0${minute}` : minute,
      second: second < 10 ? `0${second}` : second,
    };
  }, [count]);

  return { start, stop, time };
}
