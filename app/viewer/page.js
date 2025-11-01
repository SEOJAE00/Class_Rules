'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'
import langData from "../system/lang.json"
import { useLang } from "../context/LangContext";
import styles from "../css/viewer.module.css"
import Header from '../components/header';
import AdvancedSearch from '../components/advancedSearch';
import ShipNum from '../components/shipNum';
import axios from 'axios';
import FileTreeView from '../components/fileTreeView';

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

  // 호선 관련
  let [shipInfo, setShipInfo] = useState("--------");
  let [shipInfoData, setShipInfoData] = useState();
  // 선택된 선급 기관 관련
  let soci = ["KOREAN REGISTER(en)", "KOREAN REGISTER(kr)", "American Bureau of Shipping", "BUREAU VERITAS", "Det Norske Veritas", "Lloyd's Register", "Nippon Kaiji Kyokai"];
  let sociColor = ["#0085ca", "#0085ca", "#0e294c", "#7e190c", "#0f214a", "#00a99d", "#2d5ea3"];
  let sociAPI = ["KR", "KRko", "ABS", "BV", "DNV", "LR", "NK"];
  let sociNum = [1, 3, 4, 6, 2, 5, 7];
  let [goSociAPI, setGoSociAPI] = useState(sociAPI[0]);
  let [classSoci, setClassSoci] = useState(soci[0]);
  let [goSociNum, setGoSociNum] = useState(sociNum[0]);
  let [classSociColor, setClassSociColor] = useState(sociColor[0]);
  let [sociDropdownCK, setSociDropdownCK] = useState(false);

  let [folderStructure, setFolderStructure] = useState([]);
  // 처음 랜딩 때 보여지는 선급
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }

      try {
        const response = await axios.get(process.env.NEXT_PUBLIC_OUTLINE_API_URL, {
          params: { path: goSociAPI },
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setFolderStructure(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    // + 북마크 가져오는 거 추가, + 호선 가져오는 거 추가
  }, []);

  // 목차 불러오는 함수
  let handleSoci = async (apiPath, num) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_OUTLINE_API_URL, {
        params: { path: apiPath },
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setFolderStructure(response.data);
      setGoSociNum(num); // 마지막으로 누른 버튼 값 설정
      setInputValue("");
      setHtmlContent('');
      console.log(folderStructure);
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    // + 호선 가져오는 기능 추가
  };

  const resetState = () => {
    setHtmlContents([]);
    setCurrentIndex(0);
  };
  
  let [htmlContent, setHtmlContent] = useState('');
  let [htmlContents, setHtmlContents] = useState([]);
  let [currentIndex, setCurrentIndex] = useState(0);

  // let partNumber = null;
  // let chapterNumber = null;
  // let sectionNumber = null;

  // MathJax 수식 렌더링
  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise();
    }
  }, [htmlContent]);

  // 파일 불러오기
  let handleFileClick = async (filePath) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    try {
      // HTML 파일 내용 요청
      const response = await axios.get(process.env.NEXT_PUBLIC_HTML_API_URL, {
        params: { path: filePath },
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "text", // HTML 문자열로 받기
      });

      const html = response.data;

      // 상태 초기화
      resetState();

      // 파일 경로에서 파트/챕터/섹션 추출
      const match = filePath.match(/Part (\d+).*?Chapter (\d+).*?(SECTION|Section) (\d+)/);
      let formattedResult = null;

      if (match) {
        const partNumber = match[1];
        const chapterNumber = match[2];
        const sectionNumber = match[4];
        console.log(partNumber, " | ", chapterNumber, " | ", sectionNumber);

        formattedResult = `${partNumber}_${chapterNumber}_${sectionNumber}`;
        window.partNumber = partNumber;
        window.chapterNumber = chapterNumber;
        window.sectionNumber = sectionNumber;
      }

      console.log(formattedResult);
      console.log(filePath); // 이거 저장해서 가져오기
      // HTML 내용 저장
      setHtmlContent(html);
    } catch (error) {
      console.error("Error fetching HTML content:", error);
    }
  };
  
  // 북마크
  let [bookmarkCK, setBookmarkCK] = useState(true);
  // 목차 < > 검색 변경
  let [showSearch, setShowSearch] = useState(false);
  // 현재 기관 검색 관련
  let [inputValue, setInputValue] = useState(""); // 인풋값
  let [searchKeyword, setSearchKeyword] = useState([]); // 분리된 키워드 배열
  let separateKeyword = () => {
    if (!inputValue) return;
    const result = inputValue.split(",").map((item) => item.trim()).filter((item) => item !== "");
    setSearchKeyword(result);
    console.log(result);
    setShowSearch(true)
  };
  let handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      separateKeyword();
    }
  };

  // 상세검색 팝업
  let [advancedPop, setAdvancedPop] = useState(false);
  // 호선 팝업
  let [shipNumPop, setShipNumPop] = useState(false);
    
  if (lang === null) {
    return null; // 또는 로딩 스피너 넣기
  }

  return (
    <div className={styles.viewerContainer}>
      <div style={{zIndex:"9999"}}>
        {advancedPop ? <AdvancedSearch advancedPop={advancedPop} setAdvancedPop={setAdvancedPop}/> : null}
      </div>
      <div style={{zIndex:"9999"}}>
        {shipNumPop ? <ShipNum shipNumPop={shipNumPop} setShipNumPop={setShipNumPop}/> : null}
      </div>
      <Header shipInfo={shipInfo} setShipInfo={setShipInfo} classSoci={classSoci} shipInfoData={shipInfoData} advancedPop={advancedPop} setAdvancedPop={setAdvancedPop} shipNumPop={shipNumPop} setShipNumPop={setShipNumPop}/>
      
      <div className={styles.bodyWrapper}>

        <div className={styles.leftBarWrapper}>

          <div className={styles.leftBarsoci}>
            <div className={styles.soci}>
              {lang == "en" ? langData.soci[0] : langData.soci[1]}
            </div>
            <div className={styles.sociDes}>
              {lang == "en" ? langData.sociDes[0] : langData.sociDes[1]}
            </div>
            <div>
              <div className={styles.classSociWrapper} style={!sociDropdownCK ? {height:"59px"} : {height:"402px"}} onClick={()=>setSociDropdownCK(!sociDropdownCK)}>
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
            </div>
          </div>

          <div className={styles.leftBarBookmark}>
            <div className={styles.bookmarkWrapper}>
              <div className={styles.bookText}>
                {lang == "en" ? langData.bookmark[0] : langData.bookmark[1]}
              </div>
              <img src='/showBook.png' height="22px" style={{cursor:"pointer"}} onClick={()=>setBookmarkCK(!bookmarkCK)}/>
            </div>
            <div className={bookmarkCK ? styles.bookmarkActive : styles.bookmarkDisable}>
              <div>북마크1</div>
              <div>북마크2</div>
              <div>북마크3</div>
              <div>북마크4</div>
            </div>
          </div>

          <div className={styles.leftBarOutline}>
            <div className={styles.bookText}>{lang == "en" ? langData.outline[0] : langData.outline[1]}</div>
            <div className={styles.searchWrapper}>
              <input className={styles.searchInput} type='text' value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={lang == "en" ? langData.nowSearch[0] : langData.nowSearch[1]}/>
              <div onClick={separateKeyword}><img src='/search.png' className={styles.searchIcon}/></div>
            </div>

            <div className={styles.outlineWrapper}>
              <div className={`${styles.slider} ${showSearch ? styles.showSearch : ""}`}>
                
                <div className={styles.docuOutline}>
                  <div>
                    {folderStructure.map((data, i)=>{
                      return (
                        <FileTreeView data={data} key={i} onFileClick={handleFileClick}/>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.searchOutline}>
                  <div className={styles.returnText} onClick={() => setShowSearch(false)}>
                    {lang == "en" ? langData.returnOutline[0] : langData.returnOutline[1]}
                  </div>
                  <div>
                    여기에 {searchKeyword}의 검색 결과 박스
                  </div>
                </div>

              </div>
            </div>

          </div>
          
        </div>

        <div className={styles.centerBarWrapper}>
          <div>
            여기에 문서 경로 들어감
          </div>

          {
            htmlContent == '' ? 
            <div>
              문서 선택해야함 - 한영 적용하기
            </div> : 
            <div>
              <div className="col-span-2 bg-white p-4 rounded-lg shadow" style={{ overflowY: 'scroll' }} id="content">
                {Object.keys(htmlContents).length > 1 && (
                  <div className="flex justify-center mt-4">
                    {Object.keys(htmlContents).map((key, index) => (
                      <button key={index} className={`mx-2 ${currentIndex === index ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`} onClick={() => setCurrentIndex(index)}>
                        {key}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ padding: 10 }}>
                  {Object.keys(htmlContents).length > 0 ? (
                    <div id="html" dangerouslySetInnerHTML={{ __html: htmlContents[Object.keys(htmlContents)[currentIndex]] }} />
                  ) : (
                    <div id="html" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                  )}
                </div>
              </div>
            </div>
          }
        </div>

        <div className={styles.rightBarWrapper}>
          여기는 오른쪽
        </div>
      </div>

      
    </div>
  )
}