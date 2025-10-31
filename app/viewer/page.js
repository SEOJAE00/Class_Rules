'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'
import langData from "../system/lang.json"
import { useLang } from "../context/LangContext";
import styles from "../css/viewer.module.css"
import Header from '../components/header';
import AdvancedSearch from '../components/advancedSearch';

export default function Viewer() {

  let router = useRouter();

  const { lang, toggleLang } = useLang();

  // 토큰이 없으면 바로 /로 이동
  useEffect(() => {
    if (lang === null) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert(lang == "en" ? "Login is required" : "로그인이 필요합니다");
      router.replace("/");
    }
  }, [lang]);

  let [shipInfo, setShipInfo] = useState("--------");
  let [shipInfoData, setShipInfoData] = useState();
  let [classSoci, setClassSoci] = useState("");

  // 상세검색 팝업
  let [advancedPop, setAdvancedPop] = useState(false);
    
  if (lang === null) {
    return null; // 또는 로딩 스피너 넣기
  }

  return (
    <div className={styles.viewerContainer}>
      {advancedPop ? <AdvancedSearch advancedPop={advancedPop} setAdvancedPop={setAdvancedPop}/> : null}
      <Header shipInfo={shipInfo} setShipInfo={setShipInfo} classSoci={classSoci} shipInfoData={shipInfoData} advancedPop={advancedPop} setAdvancedPop={setAdvancedPop}/>
      
      <div className={styles.bodyWrapper}>
        <div className={styles.leftBarWrapper}>
          여기는 왼쪽
        </div>

        <div className={styles.centerBarWrapper}>
          여기는 중간
        </div>

        <div className={styles.rightBarWrapper}>
          여기는 오른쪽
        </div>
      </div>

      
    </div>
  )
}