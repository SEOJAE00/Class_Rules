'use Client'

import { useLang } from "../context/LangContext";
import langData from "../system/lang.json"
import styles from "../css/header.module.css"
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header( {shipInfo, setShipInfo, classSoci, shipInfoData, advancedPop, setAdvancedPop, shipNumPop, setShipNumPop} ) {

  let router = useRouter();

  const { lang, toggleLang } = useLang();

  let [shipInfoDropdown, setShipInfoDropdown] = useState(false);

  let testarr = ["12312312", "4522", "76867876675", "aegkhjasdasd", "dagfhis", "safasd"];

  // 로그아웃 함수
  let handleLogout = () => {
    localStorage.removeItem("token");
    alert(lang == "en" ?langData.logoutAlert[0] :langData.logoutAlert[1])
    router.replace("/");
  };

  // 검색 관련 스테이트, 함수
  let [inputValue, setInputValue] = useState(""); // 인풋값
  let [searchKeyword, setSearchKeyword] = useState([]); // 분리된 키워드 배열
  let separateKeyword = () => {
    if (!inputValue) return;
    const result = inputValue.split(",").map((item) => item.trim()).filter((item) => item !== "");
    setSearchKeyword(result);
    console.log(result);
    const queryString = result.map((r) => `keyword=${encodeURIComponent(r)}`).join("&");
    router.push(`/search?${queryString}`);
  };
  let handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      separateKeyword();
    }
  };
  
  return (
    <div className={styles.headerContainer}>

      <div className={styles.headerLeftWrapper}>

        <div className='flex flexAlignCenter' style={{marginRight:"20px"}}>
          <img src='/logo.png' width={142}></img>
          <div className='flex flexAlignCenter posiRela' style={{marginLeft:'40px'}}>
            <div className={styles.shipInfo}>{lang == "en" ? langData.shipNum[0] : langData.shipNum[1]}</div>
            <div className={styles.shipInfoBox} onClick={()=>setShipInfoDropdown(!shipInfoDropdown)}>
              <div className={styles.nowShipInfo}>
                {shipInfo}
              </div>
              <div className={styles.langBoxArrow}>▼</div>
            </div>
            <div className={`${styles.dropdownForm} ${shipInfoDropdown ? styles.dropdownShow : styles.dropdownHidden}`}>
              
              {
                testarr?.map((a, i)=>{
                  return (
                    <div key={i} className={styles.dropdownContents} onClick={()=>{setShipInfo(a); setShipInfoDropdown(!shipInfoDropdown)}}>
                      {a}
                    </div>
                  )
                })
              }
              <div className={styles.dropdownContents} onClick={()=> {
                setShipInfoDropdown(!shipInfoDropdown);
                setShipNumPop(!shipNumPop);
                }}>
                <span className='mainText'>{lang == "en" ? langData.newShip[0] : langData.newShip[1]}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='posiRela'>
          <input className={styles.searchInput} type='text' value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={lang == "en" ? langData.searchPlace[0] : langData.searchPlace[1]}/>
          <div onClick={separateKeyword}><img src='/search.png' className={styles.searchIcon}/></div>
        </div>
      </div>

      <div className='flex flexAlignCenter' style={{marginLeft:"10px"}}>

        <div className={styles.headerRightWrapper}>
          {/* 상세검색 버튼 */}
          <button className={styles.adSearchBtn} onClick={()=>setAdvancedPop(!advancedPop)}>
            {lang == "en" ?langData.advancedSearch[0] :langData.advancedSearch[1]}
          </button>

          <div className='flex flexAlignCenter'>
            <div onClick={toggleLang} className={styles.langToggle}><div style={{color:lang == "en" ? "#0066ff" : ""}}>En</div><div>/</div><div style={{color:lang == "en" ? "" : "#0066ff"}}>Ko</div>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              {lang == "en" ? langData.logout[0] : langData.logout[1]}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}