'use client'

import langData from "../system/lang.json"
import { useLang } from "../context/LangContext";
import styles from "../css/shipNum.module.css"
import { useState } from 'react';

export default function ShipNum({shipNumPop, setShipNumPop}) {

  // 언어 변경 함수 전역 콘텍스트
  const { lang, toggleLang } = useLang();

  let [newShipNum, setNewShipNum] = useState('');

  let handleNewShipNum = () => {
    if(newShipNum != '') {

    }
  };

  return (
    <div className={styles.back}>
      <div className={styles.shipNumWrapper}>
        <div className={styles.closeIcon} onClick={()=>{setShipNumPop(false)}}>
          <img src='/close.png' height="24px"/>
        </div>
        <div style={{marginBottom:"30px"}}>
          <div className={styles.ShipNumText}>
            {lang == "en" ? langData.newShipNum[0] : langData.newShipNum[1]}
          </div>
          <div className={styles.ShipNumDes}>
            {lang == "en" ? langData.shipNumDes[0] : langData.shipNumDes[1]}
          </div>
        </div>
        <div style={{marginBottom:"30px"}}>
          <div className={styles.newShipText}>{lang == "en" ? langData.newShipNumText[0] : langData.newShipNumText[1]}<span>*</span></div>
          <input className={styles.newShipNumInput} type='text' value={newShipNum} onChange={(e)=>{setNewShipNum(e.target.value)}} maxLength="8"/>
        </div>
        <div className={styles.submitWrapper}>
          <div className={styles.closeText} onClick={()=>{setShipNumPop(false)}}>{lang == "en" ? "Close" : "닫기"}</div>
          <button className={styles.makeBtn} onClick={handleNewShipNum}>{lang == "en" ? "Make" : "만들기"}</button>
        </div>

      </div>
    </div>
  )
}