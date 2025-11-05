'use client'

import langData from "../system/lang.json"
import { useLang } from "../context/LangContext";
import styles from "../css/shipNum.module.css"
import { useState } from 'react';
import axios from 'axios';
import Loading from './loading';

export default function ShipNum({shipNumPop, setShipNumPop, goSociNum, fetchShips}) {

  // 언어 변경 함수 전역 콘텍스트
  const { lang, toggleLang } = useLang();

  let [newShipNum, setNewShipNum] = useState('');
  let [loading, setLoading] = useState(false);

  let handleNewShipNum = async () => {
    if (newShipNum != '') {
      setLoading(true);
      try {
        const token = localStorage.getItem("token"); // 토큰 가져오기
        const response = await axios.post(
          "/api/proxy/api/ship",
          {
            hullName: newShipNum,
            shipClass: goSociNum,
          },
          {
            headers: { 
              "Authorization": `Bearer ${token}`, 
              "Content-Type": "application/json"
            }
          }
        );
        alert(lang == "en" ? "New ship number registered" : "호선 정보를 등록했습니다.");
        setShipNumPop(false);
        fetchShips();
      } catch (error) {
        console.error("호선 등록 오류:", error);
        if (error.response) {
          console.error("서버 응답:", error.response.data);
        }
        alert(lang == "en" ? "Please check ship number" : "호선 정보를 다시 확인해주세요.");
      } finally {
        setLoading(false);
      }
    }
  };


  return (
    <div className={styles.back}>
      <div style={{zIndex:"9999"}}>{loading ? <Loading setLoading={setLoading}/> : null}</div>
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
          <button className={styles.makeBtn} onClick={handleNewShipNum}>{lang == "en" ? "Register" : "등록"}</button>
        </div>

      </div>
    </div>
  )
}