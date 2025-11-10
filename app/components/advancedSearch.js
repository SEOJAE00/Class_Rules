'use client'

import axios from 'axios';
import langData from "../system/lang.json"
import styles from "../css/advanced.module.css"
import { useState, useEffect } from 'react';
import { useAdvancedSearch } from '../context/AdvancedSearch';
import { useLang } from "../context/LangContext";
import { useRouter } from 'next/navigation';
import Loading from './loading';

export default function AdvancedSearch({ setAdvancedPop }) {

  const { lang, toggleLang } = useLang();
  let router = useRouter();

  const { setAdvSearchResults, setAdvSearchKeyword } = useAdvancedSearch();

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

  const [selectedValues, setSelectedValues] = useState({
    "shipClass": [],
    "part": [],
    "chapter": [],
    "section": [] // 초기값을 빈 배열로 설정
  });

  let [andOr, setAndOr] = useState(false);
  let andOrState = andOr ? "AND" : "OR";

  const [inputs, setInputs] = useState([
    { id: 0, type: 'AND', value: "" },
    { id: 1, type: andOrState, value: "" }
  ]);  

  useEffect(() => {
    setInputs((prev) => {
      const updated = [...prev];
      if (updated[1]) {
        updated[1] = { ...updated[1], type: andOrState };
      }
      return updated;
    });
  }, [andOr, andOrState]);


  // useEffect(() => {
  //   console.log("✅ selectedValues 변경됨:", selectedValues, inputs);
  // }, [selectedValues, partList, chapterList, sectionList, inputs]);

  // 처음 랜딩 때 보여지는 선급
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

  const handleSearch = async () => {
    setLoading(true);
    try {
      // 로컬 저장소에서 토큰 가져오기
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("토큰이 없습니다.");
        setLoading(false);
        return;
      }
      
      // 필수 검색어(id: 0)가 비어있는지 확인
      if (!inputs[0].value || inputs[0].value.trim() === '') {
        alert("검색어를 입력해주세요.");
        setLoading(false); // 👈 finally가 있지만 여기서도 명시적으로 꺼줍니다.
        return; // 함수 실행 중단
      }

      // --- 👇 [적용된 부분] ---
      // 전송할 'criteria' 데이터를 필터링합니다.
      const criteriaToSend = inputs.filter(input => {
        // id: 0 (필수) 항목은 항상 포함
        if (input.id === 0) {
          return true;
        }
        
        // id: 1 (선택) 항목은 value가 비어있지 않을 때만 포함
        if (input.id === 1) {
          return input.value.trim() !== "";
        }
        
        // (id가 0과 1 외에 더 있다면 여기에 규칙 추가, 지금은 무시)
        return false;
      });
      // --- ------------------- ---

      // 요청 본문 데이터
      const body = {
        // 'inputs' 대신 필터링된 'criteriaToSend'를 사용
        criteria: criteriaToSend, 
        selectedValues: selectedValues,
      };

      // axios POST 요청
      const response = await axios.post(
        `/api/proxy/api/search?company=${encodeURIComponent(goSociNum)}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const results = response.data;

      if (!results || Object.keys(results).length === 0) {
        alert("검색 결과가 없습니다.");
      } else {
        setAdvSearchResults(results);
        // 'criteriaToSend'를 기반으로 키워드 설정 (id: 1이 없을 수도 있음)
        setAdvSearchKeyword(criteriaToSend.map(c => c.value));
        setAdvancedPop(false);
        router.push("/viewer"); 
      }
    } catch (error) {
      if (error.response) {
        console.error("Error Response:", error.response.data);
        console.error("Status:", error.response.status);
      } else if (error.request) {
        console.error("No Response:", error.request);
      } else {
        console.error("Request Setup Error:", error.message);
      }
      alert("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.back}>
      <div style={{zIndex:"9999"}}>{loading ? <Loading setLoading={setLoading}/> : null}</div>
      <div className={styles.adSearchWrapper}>
        <div className={styles.closeIcon} onClick={()=>{setAdvancedPop(false)}}>
          <img src='/close.png' height="24px"/>
        </div>
        <div style={{marginBottom:"30px"}}>
          <div className={styles.ShipNumText}>
            {lang == "en" ? langData.advancedSearch[0] : langData.advancedSearch[1]}
          </div>
          <div className={styles.ShipNumDes}>
            {lang == "en" ? langData.adSearchDes[0] : langData.adSearchDes[1]}
          </div>
        </div>

        <div className={styles.leftBarsoci}>
          <div className={styles.soci}>
            {lang == "en" ? langData.soci[0] : langData.soci[1]}<span style={{color:'#d00000'}}>*</span>
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
                          const exists = prev.some((item) => item === strValue);
                          if (exists) {
                            return prev.filter((item) => item !== strValue);
                          } else {
                            return [...prev, strValue];
                          }
                        });

                        setSelectedValues((prevValues) => {
                          const prevSectionArray = selectedValues.section; 
                          const exists = prevSectionArray.some((item) => item === strValue);
                          
                          let newSectionArray;
                          if (exists) {
                              newSectionArray = prevSectionArray.filter((item) => item !== strValue);
                          } else {
                              newSectionArray = [...prevSectionArray, strValue];
                          }
                          return {
                              ...prevValues, // 'shipClass', 'part', 'chapter' 유지
                              section: newSectionArray // 'section' 배열 덮어쓰기
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

        {/* 여기서 부터 검색 인풋 관리 */}
        <div>
          <div>
            <div className={styles.selectText}>{lang == "en" ? "Keyword" : "키워드"}<span>*</span></div>
            <input type="text" value={inputs[0]?.value || ""} className={styles.keywordInput}
              onChange={(e) => {
              setInputs((prev) => {
                const newInputs = [...prev];
                newInputs[0] = { ...newInputs[0], value: e.target.value };
                return newInputs;
              });
            }}/>
          </div>
          <div style={{margin:"30px 0"}} className='posiRela'>
            <div className={styles.andKeyword}>
              <div className={styles.selectText}>{lang == "en" ? "And & Or Keyword" : "And & Or 키워드"}</div>
              <div className={styles.optionText}>{lang == "en" ? "(option)" : "(선택)"}</div>
            </div>
            <input type="text" value={inputs[1]?.value || ""} className={styles.keywordInput2}
              onChange={(e) => {
              setInputs((prev) => {
                const newInputs = [...prev];
                newInputs[1] = { ...newInputs[1], value: e.target.value };
                return newInputs;
              });
            }}/>
            <div className={styles.switchCondi} onClick={()=>{setAndOr(!andOr)}}>
              <div className={styles.selectAnd} style={andOr ? {color:"#fff"} : {color:"#555"}}>And</div>
              <div className={styles.selectOr} style={!andOr ? {color:"#fff"} : {color:"#555"}}>Or</div>
              <div className={styles.selectedCondi} style={andOr ? {left:"0px"} : {left:"44px"}}></div>
            </div>
          </div>
        </div>
        <div className={styles.submitWrapper}>
          <div className={styles.closeText} onClick={()=>{setAdvancedPop(false)}}>{lang == "en" ? "Close" : "닫기"}</div>
          <button className={styles.makeBtn} onClick={handleSearch}>{lang == "en" ? "Search" : "검색"}</button>
        </div>

      </div>
    </div>
  );
}