'use client'

import styles from "../css/feedback.module.css";
import Loading from './loading';
import langData from "../system/lang.json";
import { useLang } from "../context/LangContext";
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Feedback({ setFeedback }) {
  
  // 언어 변경 함수 전역 콘텍스트
  const { lang, toggleLang } = useLang();
  
  let [loading, setLoading] = useState(false);

  // let soci = ["KOREAN REGISTER(en)", "KOREAN REGISTER(kr)", "American Bureau of Shipping", "BUREAU VERITAS", "Det Norske Veritas", "Lloyd's Register", "Nippon Kaiji Kyokai"];
  // let sociColor = ["#0085ca", "#0085ca", "#0e294c", "#7e190c", "#0f214a", "#00a99d", "#2d5ea3"];
  // let sociAPI = ["KR", "KRko", "ABS", "BV", "DNV", "LR", "NK"];
  // let sociNum = [4, 5, 1, 2, 6, 3, 7];
  let soci = ["American Bureau of Shipping", "Det Norske Veritas", "Lloyd's Register"];
  let sociColor = ["#0e294c", "#0f214a", "#00a99d"];
  let sociAPI = ["ABS", "DNV", "LR"];
  let sociNum = [1, 6, 3];
  

  let [goSociAPI, setGoSociAPI] = useState(sociAPI[0]);
  let [classSoci, setClassSoci] = useState(soci[0]);
  let [goSociNum, setGoSociNum] = useState(sociNum[0]);
  let [classSociColor, setClassSociColor] = useState(sociColor[0]);
  let [sociDropdownCK, setSociDropdownCK] = useState(false);

  let [folderStructure, setFolderStructure] = useState([]);

  let [partDrop, setPartDrop] = useState(false);
  let [partList, setPartList] = useState();
  let [chapterDrop, setChapterDrop] = useState(false);
  let [chapterList, setChapterList] = useState();
  let [sectionDrop, setSectionDrop] = useState(false);
  let [sectionList, setSectionList] = useState([]);

  let [selectedPartIndex, setSelectedPartIndex] = useState(null); // ✅ 수정
  let [selectedChapterIndex, setSelectedChapterIndex] = useState(null); // ✅ 수정

  let [contentValue, setContentValue] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const [selectedValues, setSelectedValues] = useState({
    "shipClass": [],
    "part": [],
    "chapter": [],
    "section": [],
    "text": ''
  });

  useEffect(() => {
    setSelectedValues(prevValues => ({
      ...prevValues,
      text: contentValue
    }));
  }, [contentValue]);

  // useEffect(() => {
  //   console.log("✅ selectedValues 변경됨:", selectedValues);
  // }, [selectedValues, partList, chapterList, sectionList, contentValue]);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }

      try {
        const response = await axios.get("/api/proxy/api/outlines", {
          params: { path: goSociAPI },
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setFolderStructure(response.data);
        //console.log(response.data);
        setSelectedValues((prev) => ({
          ...prev,
          shipClass: [goSociNum.toString()]
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
      setLoading(false);
    }
    };
    fetchData();
  }, []);

  // 목차 불러오는 함수
  let handleSoci = async (apiPath, num) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }
    try {
      const response = await axios.get("/api/proxy/api/outlines", {
        params: { path: apiPath },
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setFolderStructure(response.data);
      setGoSociNum(num); // 마지막으로 누른 버튼 값 설정
      setSelectedValues((prev) => ({
        ...prev,
        shipClass: [num.toString()],
        part: [],
        chapter: [],
        section: [],
      }));
      setPartList();
      setChapterList();
      setSectionList([]);
      setSelectedPartIndex(null);
      setSelectedChapterIndex(null);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  let handleSubmit = async () => {
    if(isChecked && contentValue != "") {
      const token = localStorage.getItem("token"); // 토큰 가져오기

      try {
        const response = await fetch("/api/proxy/api/feedback", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedValues), // 상태를 JSON으로 전송
        });

        if (!response.ok) {
          throw new Error(`서버 오류: ${response.status}`);
        }

        const data = await response.json();
        console.log("피드백 전송 성공:", data);
        alert(lang == "en" ? "Thank You" : "피드백이 전송되었습니다.");
        setFeedback(false);
      } catch (error) {
        console.error("피드백 전송 실패:", error);
        alert("피드백 전송 중 오류가 발생했습니다.");
      }
    }
  }

  return (
    <div className={styles.back}>
      <div style={{zIndex:"9999"}}>{loading ? <Loading setLoading={setLoading}/> : null}</div>

      <div className={styles.shipNumWrapper}>
        <div className={styles.closeIcon} onClick={()=>{setFeedback(false)}}>
          <img src='/close.png' height="24px"/>
        </div>

        <div style={{marginBottom:"30px"}}>
          <div className={styles.ShipNumText}>
            {lang == "en" ? langData.feedback[0] : langData.feedback[1]}
          </div>
          <div className={styles.ShipNumDes}>
            {lang == "en" ? langData.feedbackDes[0] : langData.feedbackDes[1]}
          </div>
        </div>

        <div style={{marginBottom:"24px"}}>
          <div className={styles.leftBarsoci}>
            <div className={styles.flexBox}>
              <div className={styles.soci}>{lang == "en" ? langData.soci[0] : langData.soci[1]}</div>
              <div className={styles.selectText2}>{lang == "en" ? "(option)" : "(선택)"}</div>
            </div>

            <div className={styles.classSociWrapper} style={!sociDropdownCK ? {height:"59px"} : {height:"210px"}} onClick={()=>setSociDropdownCK(!sociDropdownCK)}>
              <div className='flex' style={{justifyContent:"space-between", marginLeft:"20px"}}>
                <div className="flex">
                  <img src={`/sociCover/${classSoci}.png`} style={{height:"19px"}}/>
                  <div className={styles.sociText} style={{color:classSociColor}}>{classSoci}</div>
                </div>
                <img src='/down.png' height="19px"/>
              </div>
              <div style={{marginTop:"20px"}} className={sociDropdownCK ? styles.active : styles.disable}>
                {
                  soci.map((a, i)=>{
                    return (
                      <div className={styles.selectSoci} key={i} onClick={()=>{
                        setClassSoci(soci[i]);
                        setClassSociColor(sociColor[i]);
                        setGoSociAPI(sociAPI[i]);
                        setGoSociNum(sociNum[i]);
                        handleSoci(sociAPI[i], sociNum[i]);
                      }}>
                        <img src={`/sociCover/${a}.png`} style={{height:"19px"}}/>
                        <div className={styles.sociText} style={{color:sociColor[i]}}>{a}</div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            <div style={{display:'flex', gap:"20px", marginBottom:"24px"}}>

              <div className='posiRela'>
                <div style={{marginBottom:"6px"}}>
                  <div className={styles.selectTextBox}>
                    <div className={styles.selectText}>{lang == "en" ? "Part" : "편"}</div>
                    <div className={styles.selectText2}>{lang == "en" ? "(option)" : "(선택)"}</div>
                  </div>

                  <div className={styles.partBox} onClick={()=>setPartDrop(!partDrop)}>
                    {
                      partList == null ? <div className={styles.selectText3}>{lang == "en" ? "Select" : "리스트"}</div> :
                      <div style={{marginLeft:"20px"}}>
                        {partList.map((a, i) => {
                          return (
                            <div key={i} className={styles.selectedBox}>
                              <div className={styles.selectedText}>{a}</div>
                              <img src='/delete.png' height={20} onClick={()=>{              setPartList();
                              setChapterList();
                              setSectionList([]);
                              setSelectedPartIndex(null);
                              }}
                              style={{ cursor: "pointer" }}/>
                            </div>
                          )
                        })}
                      </div>
                    }
                    <img src='/down.png' height={24}/>
                  </div>
                </div>

                <div className={`${styles.dropList} ${partDrop ? styles.active : styles.disable}`}>
                  {folderStructure[0]?.children.map((a, i) => {
                    // 이름에서 "5"만 추출
                    const partName = a.name.match(/Part\s*(\d+)/i)?.[1];
                    return (
                      <div key={i} className={styles.listContent}
                        onClick={() => {
                          setPartList([partName]);
                          setSelectedPartIndex(i);
                          setPartDrop(false);
                          setSelectedValues(prev => ({
                            ...prev,
                            part: [partName], // 배열로 저장 (필요 시 그냥 문자열로도 가능)
                          }));
                        }}>
                        {partName}
                      </div>
                  );})}
                </div>
              </div>

              {/* 챕터 선택 */}
              <div className='posiRela'>
                <div style={{marginBottom:"6px"}}>
                  <div className={styles.selectTextBox}>
                    <div className={styles.selectText}>{lang == "en" ? "Chapter" : "장"}</div>
                    <div className={styles.selectText2}>{lang == "en" ? "(option)" : "(선택)"}</div>
                  </div>

                  <div className={styles.partBox} onClick={()=>setChapterDrop(!chapterDrop)}>
                    {
                      chapterList == null ? <div className={styles.selectText3}>{lang == "en" ? "Select" : "리스트"}</div> :
                      <div style={{marginLeft:"20px"}}>
                        {chapterList.map((a, i) => {
                          return (
                            <div key={i} className={styles.selectedBox}>
                              <div className={styles.selectedText}>{a}</div>
                              <img src='/delete.png' height={20} onClick={()=>{              setChapterList();
                              setSectionList([]);
                              setSelectedChapterIndex(null);
                              }}
                              style={{ cursor: "pointer" }}/>
                            </div>
                          )
                        })}
                      </div>
                    }
                    <img src='/down.png' height={24}/>
                  </div>
                </div>

                <div className={`${styles.dropList} ${chapterDrop ? styles.active : styles.disable}`}>
                  {folderStructure[0]?.children[selectedPartIndex]?.children.map((a, i) => {
                    // 이름에서 "Part 5"만 추출
                    const chapterName = a.name.match(/Chapter\s*(\d+)/i)?.[1];
                    return (
                      <div key={i} className={styles.listContent}
                        onClick={() => {
                          setChapterList([chapterName]);
                          setSelectedChapterIndex(i); // ✅ 'i' (숫자)를 직접 저장
                          setChapterDrop(false);
                          setSelectedValues(prev => ({
                            ...prev,
                            chapter: [chapterName], // 배열로 저장 (필요 시 그냥 문자열로도 가능)
                          }));
                        }}>
                        {chapterName}
                      </div>
                  );})}
                </div>
              </div>
              {/* 섹션 선택 */}
              <div className='posiRela'>
                <div style={{marginBottom:"6px"}}>
                  <div className={styles.selectTextBox}>
                    <div className={styles.selectText}>{lang == "en" ? "Section" : "절"}</div>
                    <div className={styles.selectText2}>{lang == "en" ? "(option)" : "(선택)"}</div>
                  </div>

                  <div className={styles.partBox} onClick={()=>setSectionDrop(!sectionDrop)}>
                    {
                      sectionList.length == 0 ? <div className={styles.selectText3}>{lang == "en" ? "Select" : "리스트"}</div> :
                      <div style={{marginLeft:"20px"}} className='flex'>
                        {sectionList.map((a, i) => {
                          return (
                            <div key={i} className={styles.selectedBox}>
                              <div className={styles.selectedText}>{a}</div>
                                <img src='/delete.png' height={20} onClick={() => {
                                  setSectionList((prev) => 
                                    prev.filter((item) => item !== a)
                                  );
                                  setSelectedValues((prevValues) => {
                                    const newSectionArray = prevValues.section.filter((item) => item !== a);
                                    
                                    return {
                                      ...prevValues, section: newSectionArray
                                    };
                                  });
                                }}
                              style={{ cursor: "pointer" }}/>
                            </div>
                          )
                        })}
                      </div>
                    }
                    <img src='/down.png' height={24}/>
                  </div>
                </div>

                <div className={`${styles.dropList} ${sectionDrop ? styles.active : styles.disable}`}>
                  {folderStructure[0]?.children[selectedPartIndex]?.children[selectedChapterIndex]?.children.map((a, i) => {

                    const strValue = (i + 1).toString(); // ✅ 숫자를 문자열로 변환

                    return (
                      <div key={i} className={styles.listContent}
                        onClick={() => {
                          setSectionList((prev) => {
                            // 이미 선택된 값이면 해제, 아니면 해당 값만 단독으로 설정
                            const exists = prev.includes(strValue);
                            return exists ? [] : [strValue];
                          });

                          setSelectedValues((prevValues) => {
                            // section 배열을 단일 값으로만 유지
                            const prevSectionArray = prevValues.section || [];
                            const exists = prevSectionArray.includes(strValue);

                            return {
                              ...prevValues, // shipClass, part, chapter 유지
                              section: exists ? [] : [strValue], // 항상 하나만 선택되도록
                            };
                          });
                          setSectionDrop(false);
                        }}>
                        {i+1}
                      </div>
                  );})}
                </div>
              </div>
            </div>
          </div>

        </div>

        <div>
          <div>
            <div className={styles.selectText}>{lang == "en" ? "Contents" : "내용"}<span>*</span></div>
            <textarea value={contentValue} className={styles.contents} placeholder={lang == "en" ? "Write Here" : "피드백을 작성해주세요"} onChange={(e)=>{setContentValue(e.target.value)}}/>
          </div>

          <div className='flex'>
            <input type="checkbox" checked={isChecked} onChange={(e)=>{
              setIsChecked(e.target.checked);
            }} id="agree" className={styles.checkBox}/>
            <div style={{color:'#555', fontWeight:'400'}}>{lang == "en" ? langData.agreeCK[0] : langData.agreeCK[1]}</div>
          </div>

        </div>

        <div className={styles.submitWrapper}>
          <div className={styles.closeText} onClick={()=>{setFeedback(false)}}>{lang == "en" ? "Close" : "닫기"}</div>
          <button className={styles.makeBtn} onClick={handleSubmit}>{lang == "en" ? "Submit" : "제출"}</button>
        </div>
      </div>
    </div>
  )
}