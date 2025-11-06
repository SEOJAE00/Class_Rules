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
import Loading from '../components/loading';
import HtmlPopup from '../components/navigatePopup';
import Terms from '../components/terms';
import Feedback from '../components/feedback';

export default function Viewer() {

  let router = useRouter();

  const { lang, toggleLang } = useLang();

  // 로딩
  let [loading, setLoading] = useState(false);

  let [terms, setTerms] = useState(false);
  let [feedback, setFeedback] = useState(false);

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
  let [shipInfoData, setShipInfoData] = useState([]);
  // 선택된 선급 기관 관련
  let soci = ["KOREAN REGISTER(en)", "KOREAN REGISTER(kr)", "American Bureau of Shipping", "BUREAU VERITAS", "Det Norske Veritas", "Lloyd's Register", "Nippon Kaiji Kyokai"];
  let sociColor = ["#0085ca", "#0085ca", "#0e294c", "#7e190c", "#0f214a", "#00a99d", "#2d5ea3"];
  let sociAPI = ["KR", "KRko", "ABS", "BV", "DNV", "LR", "NK"];
  //let sociNum = [1, 3, 4, 6, 2, 5, 7];
  let sociNum = [4, 5, 1, 2, 6, 3, 7];
  let [goSociAPI, setGoSociAPI] = useState(sociAPI[0]);
  let [classSoci, setClassSoci] = useState(soci[0]);
  let [goSociNum, setGoSociNum] = useState(sociNum[0]);
  let [classSociColor, setClassSociColor] = useState(sociColor[0]);
  let [sociDropdownCK, setSociDropdownCK] = useState(false);
  let [bookmark, setBookmark] = useState([]);
  let [updateDate, setUpdateDate] = useState('2025.05.15');
  let [selectedFile, setSelectedFile] = useState(null);

  const isBookmarkHere = bookmark.some(bookmark =>
    bookmark.fileDetails.some(file => file.filePath === selectedFile)
  );

  let [folderStructure, setFolderStructure] = useState([]);
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
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
      setLoading(false);
    }
    };
    fetchData();

    fetchShips();
    fetchBookmark();
    // + 북마크 가져오는 거 추가, + 호선 가져오는 거 추가
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
      if(goSociNum != num) {
        setShipInfo("--------");
      }
      setFolderStructure(response.data);
      setGoSociNum(num); // 마지막으로 누른 버튼 값 설정
      setInputValue("");
      setHtmlContent('');
      setFilePath('');
      setShowSearch(false);
      console.log(folderStructure);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }

    // + 호선 가져오는 기능 추가
  };

  const fetchShips = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }

      const response = await axios.get("/api/proxy/api/ship", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setShipInfoData(response.data);
      console.log("Ships:", response.data);
    } catch (error) {
      console.error("Error fetching ship list:", error);
    } finally {
      setLoading(false);
    }
  }

  const fetchBookmark = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }

      const response = await axios.get("/api/proxy/api/bookmark", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setBookmark(response.data);
      console.log("Bookmark:", response.data);
    } catch (error) {
      console.error("Error fetching ship list:", error);
    }
  }

  const resetState = () => {
    setHtmlContents([]);
    setCurrentIndex(0);
  };
  
  let [htmlContent, setHtmlContent] = useState('');
  let [htmlContents, setHtmlContents] = useState([]);
  let [currentIndex, setCurrentIndex] = useState(0);
  let [navigateHtml, setNavigateHtml] = useState('');
  let [isNavigateOpen, setNavigateOpen] = useState(false);
  let [memo, setMemo] = useState('');
  let [calcLog, setCalcLog] = useState(null); // ✅ 이 줄을 추가하세요

  useEffect(() => {
    window.setNavigateHtml = (value) => {
      setNavigateHtml(value);
      setNavigateOpen(true);
    };
  }, []);

  let [filePath, setFilePath] = useState([]);
  let [currnetFilePath, setCurrentFilePath] = useState([]);

  // let partNumber = null;
  // let chapterNumber = null;
  // let sectionNumber = null;

  let handleBookmarkAdd = async () => {
    try {
      const token = localStorage.getItem("token"); // 토큰 가져오기
      const response = await axios.post(
        "/api/proxy/api/bookmark",
        {
          shipClass: goSociNum,
          filePath: selectedFile,
        },
        {
          headers: { 
            "Authorization": `Bearer ${token}`, 
            "Content-Type": "application/json"
          }
        }
      );
      fetchBookmark();
    } catch (error) {
      console.error("북마크 등록 오류:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
      }
      alert(lang == "en" ? "Please refresh the page" : "페이지를 새로고침 해주세요.");
    }
  };
  let handleBookmarkRemove = async (filePath) => {
    try {
      const token = localStorage.getItem("token"); // 토큰 가져오기
      const response = await axios.delete("/api/proxy/api/bookmark", {
        data: { filePath: filePath }, // ✅ JSON body로 전달
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      fetchBookmark();
    } catch (error) {
      console.error("북마크 등록 오류:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
      }
      alert(lang == "en" ? "Please refresh the page" : "페이지를 새로고침 해주세요.");
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      function handleSubmit(value) {
        const inputs = document.querySelectorAll(\`\\.list-item-\${value}\`);
        let requestUrl = \`/api/proxy/api/calc?company=${goSociNum}&shipInfo=${shipInfo}&parent=\${value}\`;
  
        inputs.forEach((input, index) => {
          if (input.value.trim() !== '') {
            // requestUrl += \`&\${input.id}=\${input.value.trim()}\`;
          const encodedKey = encodeURIComponent(input.id);   // 키(URL 파라미터 이름) 인코딩
          const escapedKey = CSS.escape(input.id);
          const encodedValue = encodeURIComponent(input.value.trim()); // 값(URL 파라미터 값) 인코딩
          requestUrl += \`&\${encodedKey}=\${encodedValue}\`;
          
          const inputElements = document.querySelectorAll(\`\#\${escapedKey}\`);
          inputElements.forEach((inputElement) => {
            if (inputElement.tagName === 'INPUT') {
              inputElement.value = input.value.trim();
            }
          });
          }
        });
  
        const token = localStorage.getItem("token"); // 토큰을 로컬 스토리지에서 가져옴
        fetch(requestUrl, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token, // Authorization 헤더에 토큰 포함
            'Content-Type': 'application/json'
          }
        })
        .then((response) => {
          if (!response.ok) {
            throw new Error(\`HTTPS error! status: \${response.status}\`);
          }
          return response.json();
        })
        .then((data) => {
          console.log('Received data:', data);
          alert(Object.keys(data) + ' = ' + Object.values(data));
  
          Object.entries(data).forEach(([key, value]) => {
            const escapedKey = key.replace(/\{/g, '\\\\7B ').replace(/\}/g, '\\\\7D ');
            const inputElements = document.querySelectorAll(\`\#\${escapedKey}\`);
            inputElements.forEach((inputElement) => {
              if (inputElement.tagName === 'INPUT') {
                inputElement.value = value;
              }
            });
          });
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }

      function myNavigator(value) {
	      event.preventDefault(); // 기본 링크 동작을 막습니다.

        let [partValue, chapterValue, sectionValue] = value.split("_");

        if (partValue === "0") {
          partValue = window.partNumber;
        }
        if (chapterValue === "0") {
          chapterValue = window.chapterNumber;
        }
        if (sectionValue === "0") {
          sectionValue = window.sectionNumber;
        }

        value = \`\${partValue}_\${chapterValue}_\${sectionValue}\`;

        let requestUrl = \`/api/proxy/api/navigator?company=${goSociNum}&documentInfo=\${value}\`;
        const token = localStorage.getItem("token"); // 토큰을 로컬 스토리지에서 가져옴
        fetch(requestUrl, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + token, // Authorization 헤더에 토큰 포함
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch HTML content. Please check authentication.");
        }
        return response.text();
        })
        .then((data) => {
          window.setNavigateHtml(data); // React 상태 변경
          console.log("API 요청");
        })
        .catch(error => console.error("Error fetching HTML content:", error));
      }

      function handleFocus(inputId) {
        const el = document.querySelector(\`[id="\${inputId}"].disabled-style\`);
        console.log(inputId);
        console.log(el);
        if (el && el.classList.contains('disabled-style')) {
          el.focus();
        } else {
          console.error('해당 id와 클래스를 가진 요소를 찾을 수 없습니다.');
          }
      }
    `;
    document.body.appendChild(script);
  }, [shipInfo, goSociNum]);

  // MathJax 수식 렌더링
  useEffect(() => {
    // 1. MathJax 렌더링
    if (window.MathJax) {
      window.MathJax.typesetPromise()
        .then(() => {
          console.log("MathJax typesetting complete.");
        })
        .catch((err) => console.error("MathJax error:", err));
    }

    // 2. 계산 기록 주입 (calcLog 데이터가 있을 때만 실행)
    if (calcLog) {
      console.log("Injecting calculation log:", calcLog);
      const data = calcLog; // state에서 데이터 가져오기

      data.forEach(item => {
        const inputPairs = item.input ? item.input.replace(/[{}]/g, '').split(', ') : [];
        const resultPairs = item.result ? item.result.replace(/[{}]/g, '').split(', ') : [];
        const pairs = [...inputPairs, ...resultPairs];

        pairs.forEach(pair => {
          const [key, value] = pair.split('=');
          if (key && value) {
            try {
              // 중괄호와 같은 특수 문자를 CSS 선택자에 맞게 이스케이프
              const escapedKey = key.trim().replace(/\{/g, '\\\\7B').replace(/\}/g, '\\\\7D');
              const inputElements = document.querySelectorAll(`#${escapedKey}`);
              
              inputElements.forEach(el => {
                if (el.tagName === 'INPUT') el.value = value.trim();
              });

            } catch (e) {
              console.error(`Error processing calculation log key: ${key}`, e);
            }
          }
        });
      });
      // DOM 주입이 완료된 후 calcLog를 null로 비우지 않습니다.
      // (팝업 등으로 인한 재렌더링 시 값이 유지되어야 함)
    }
  }, [htmlContent, isNavigateOpen, calcLog]); // ✅ 의존성 배열에 'calcLog' 추가

  let handleFilePath = (filePath) => {
    let trimmed = filePath.replace(/^\/data\//, "");
    trimmed = trimmed.replace(/\.html$/, "");
    const parts = trimmed.split("/");
    setFilePath(parts);

    const lastTwo = parts.slice(-2);
    setCurrentFilePath(lastTwo);
  };

  let [dataList, setDataList] = useState([]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'auto' });
    }
  };

  // 문서 변경 함수
  let handleFileClick = async (filePath) => {
    setLoading(true);
    setCalcLog(null); // ✅ 중요: 이전 계산 기록을 즉시 제거
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage.");
      setLoading(false);
      return;
    }

    let html = '';
    try {
      // --- 1. HTML 파일 내용 요청 (필수) ---
      const response = await axios.get("/api/proxy/api/html", {
        params: { path: filePath },
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "text",
      });

      html = response.data;

    } catch (error) {
      console.error("Error fetching HTML content:", error);
      setLoading(false);
      return;
    }

    // --- 2. 상태 초기화 (HTML 로드 성공 후) ---
    resetState();
    const match = filePath.match(/Part (\d+).*?Chapter (\d+).*?(SECTION|Section) (\d+)/);
    if (match) {
      const partNumber = match[1];
      const chapterNumber = match[2];
      const sectionNumber = match[4];
      console.log(partNumber, " | ", chapterNumber, " | ", sectionNumber);
      window.partNumber = partNumber;
      window.chapterNumber = chapterNumber;
      window.sectionNumber = sectionNumber;
    }
    handleFilePath(filePath);
    setSelectedFile(filePath);
    setMemo(''); // 메모 상태 초기화
    setShowSearch(false);
    setHtmlContent(html); // HTML 콘텐츠 설정 (1차 렌더링 유발)

    // --- 3. 메모 및 계산 기록 병렬 요청 ---
    try {
      // 메모 요청 프로미스
      const memoPromise = axios.get("/api/proxy/api/memo", {
        params: { filePath: filePath },
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        validateStatus: (status) => status >= 200 && status < 300 || status === 404,
      });

      // 계산 기록 요청 프로미스
      const logPromise = axios.get("/api/proxy/api/calculation-log", {
        params: { shipInfo, info: goSociNum },
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // 두 요청이 모두 완료될 때까지 대기
      const [memoResponse, logResponse] = await Promise.all([memoPromise, logPromise]);

      // --- 4. 메모 결과 처리 ---
      if (memoResponse.status === 404 || !memoResponse.data) {
        setMemo("");
      } else {
        setMemo(memoResponse.data); // 'setMemo'가 2차 렌더링 유발
      }
      console.log("Memo loaded.");

      // --- 5. 계산 기록 결과 처리 ---
      setCalcLog(logResponse.data); // ✅ DOM 주입 대신 State에 저장 (2차 렌더링 유발)
      console.log("Calculation log fetched and stored in state.");

    } catch (error) {
      console.error("Error fetching memo or calculation log:", error);
      // setCalcLog(null); // 이미 위에서 null로 설정됨
    } finally {
      setLoading(false); // 'setLoading'이 2차 렌더링 유발
    }
  };

  const handleDownload = () => {
  // 로컬 스토리지에서 토큰 가져오기
    const token = localStorage.getItem("token");

    // 이전의 계산 기록 요청
    fetch(`/api/proxy/api/download-log?shipInfo=${shipInfo}&info=${goSociNum}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`, // 토큰을 Authorization 헤더에 추가
      },
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'data.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  // html 내 계산 함수
  const handleSubmit = (index) => {
    const liElement = document.getElementById(`list-item-${index}`);
    const inputElements = liElement.getElementsByTagName('input');
    const inputValues = Array.from(inputElements).map(input => input.value);

    // 입력 값이 있는 경우에만 해당 항목의 값을 변수로 만듭니다.
    const submittedData = inputValues.reduce((acc, value, innerIndex) => {
      if (value !== '') {
        acc.push(`${encodeURIComponent(dataList[index][innerIndex + 1])}=${encodeURIComponent(value)}`);
      }
      return acc;
    }, []);

    // 각 항목의 값을 출력합니다.
    console.log('Submitted dataList:', dataList[index][0], submittedData.join(', '));

    // GET 요청을 보낼 URL 생성
    const baseUrl = '/api/proxy/api/calc?parent=' + dataList[index][0];
    const queryParams = submittedData.join('&');
    const url = baseUrl + '&' + queryParams;

    // GET 요청 보내기
    axios.get(url)
      .then(response => {
        const mapEntries = Object.entries(response.data).map(([key, value]) => `${key}: ${value}`);
        const alertMessage = mapEntries.join(`\n`);

        // 응답 처리
        console.log('Response:', response.data);
        alert(alertMessage);
      })
      .catch(error => {
        // 오류 처리
        console.error('Error:', error);
      });
  };
  
  // 북마크
  let [bookmarkCK, setBookmarkCK] = useState(true);
  // 목차 < > 검색 변경
  let [showSearch, setShowSearch] = useState(false);
  // 현재 기관 검색 관련
  let [inputValue, setInputValue] = useState(""); // 인풋값
  let [searchKeyword, setSearchKeyword] = useState([]); // 분리된 키워드 배열
  let [searchKeywordResult, setSearchKeywordResult] = useState([]);

  let separateKeyword = () => {
    if (!inputValue) return [];
    const result = inputValue
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");
    setSearchKeyword(result);
    return result; // ✅ 분리된 키워드를 반환
  };

  const handleOnesearch = async (keywords) => {

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const response = await axios.post(
        "/api/proxy/api/onesearch",
        {
          shipClass: goSociNum,
          words: keywords, // ✅ 전달받은 키워드 사용
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setSearchKeywordResult(response.data);
      setShowSearch(true);
      console.log(response.data);
    } catch (error) {
      console.error("요청 오류:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
      }
      alert(lang == "en" ? "Please refresh the page" : "페이지를 새로고침 해주세요.");
    }
  };
  let handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const keywords = separateKeyword();
      handleOnesearch(keywords);
    }
  };

  let handleDeleteMemo =  async () => {
    try {
      const token = localStorage.getItem("token"); // 토큰 가져오기
      if (!token) {
        alert(lang == "en" ? "Login required" : "로그인이 필요합니다.");
        return;
      }
      const response = await axios.delete("/api/proxy/api/memo", {
        data: { filePath: selectedFile }, // ✅ JSON body로 전달
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setMemo('');
      alert(lang == "en" ? "Memo successfully deleted" : "메모가 삭제되었습니다.");
    } catch (error) {
      console.error("메모 삭제 오류:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
      }
      alert(lang == "en" ? "Please refresh the page" : "페이지를 새로고침 해주세요.");
    }
  };

  let handleSubmitMemo = async () => {
    try {
        const token = localStorage.getItem("token"); // 토큰 가져오기
        const response = await axios.post(
          "/api/proxy/api/memo",
          {
            filePath: selectedFile,
            text: memo,
          },
          {
            headers: { 
              "Authorization": `Bearer ${token}`, 
              "Content-Type": "application/json"
            }
          }
        );
        setMemo(memo);
        alert(lang == "en" ? "Memo successfully created" : "메모가 작성되었습니다.");
      } catch (error) {
        console.error("메모 등록 오류:", error);
        if (error.response) {
          console.error("서버 응답:", error.response.data);
        }
        alert(lang == "en" ? "Please refresh the page" : "페이지를 새로고침 해주세요.");
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
      <div style={{zIndex:"9999"}}>{feedback ? <Feedback setFeedback={setFeedback}/> : null}</div>
      <div style={{zIndex:"9999"}}>{terms ? <Terms setTerms={setTerms}/> : null}</div>
      <div style={{zIndex:"9999"}}>{loading ? <Loading setLoading={setLoading}/> : null}</div>
      <div style={{zIndex:"9999"}}>
        {advancedPop ? <AdvancedSearch advancedPop={advancedPop} setAdvancedPop={setAdvancedPop}/> : null}
      </div>
      <div style={{zIndex:"9999"}}>
        {shipNumPop ? <ShipNum shipNumPop={shipNumPop} setShipNumPop={setShipNumPop} goSociNum={goSociNum} fetchShips={fetchShips}/> : null}
      </div>
      <Header shipInfo={shipInfo} setShipInfo={setShipInfo} classSoci={classSoci} shipInfoData={shipInfoData} advancedPop={advancedPop} setAdvancedPop={setAdvancedPop} shipNumPop={shipNumPop} setShipNumPop={setShipNumPop} setHtmlContent={setHtmlContent} setSelectedFile={setSelectedFile} goSociNum={goSociNum}/>
      
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
              {
                bookmark.map((a, i) => {
                  const sociIndex = sociNum.indexOf(Number(a.shipClass));
                  const sociName = soci[sociIndex];
                  const sociColorValue = sociColor[sociIndex];

                  // 마지막 요소인지 확인
                  const isLast = i === bookmark.length - 1;

                  return (
                    <div
                      key={i}
                      style={{
                        marginBottom: isLast ? '0px' : '20px', // 마지막만 0px
                      }}>
                      <div className={styles.sociTextWrapper2}>
                        <img src={`/sociCover/${sociName}.png`} height={17}/>
                        <div className={styles.sociText2} style={{ color: sociColorValue }}>
                          {sociName}
                        </div>
                      </div>
                      <div>
                        {
                          a.fileDetails.map((a, i)=>{
                            return (
                              <div className={styles.bookWrapper} key={i}>
                                <div className={styles.bookmarkContentWrapper} onClick={async ()=>{  // ✅ async 추가
                                  try {
                                    setClassSoci(soci[sociIndex]);
                                    setClassSociColor(sociColor[sociIndex]);
                                    setGoSociAPI(sociAPI[sociIndex]);
                                    setGoSociNum(sociNum[sociIndex]);
                                    await handleSoci(sociAPI[sociIndex], sociNum[sociIndex]);
                                    handleFileClick(a.filePath);
                                  } catch (error) {
                                    console.error("Error handling bookmark click:", error);
                                  }}}>
                                  <div>-</div>
                                  <div>{a.title}</div>
                                </div>
                                <img src='/delete.png' height={20} style={{cursor:"pointer"}} onClick={()=>handleBookmarkRemove(a.filePath)}/>
                              </div>
                            )
                          })
                        }
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>

          <div className={styles.leftBarOutline}>
            <div className={styles.bookText}>{lang == "en" ? langData.outline[0] : langData.outline[1]}</div>
            <div className={styles.searchWrapper}>
              <input className={styles.searchInput} type='text' value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={lang == "en" ? langData.nowSearch[0] : langData.nowSearch[1]}/>
              <div onClick={()=>{
                const keywords = separateKeyword(); // 분리된 키워드 받기
                handleOnesearch(keywords); // 바로 전달
              }}><img src='/search.png' className={styles.searchIcon}/></div>
            </div>

            <div className={styles.outlineWrapper}>
              <div className={`${styles.slider} ${showSearch ? styles.showSearch : ""}`}>
                
                <div className={styles.docuOutline}>
                  <div>
                    {folderStructure.map((data, i)=>{
                      return (
                        <FileTreeView data={data} key={i} onFileClick={handleFileClick} selectedFile={selectedFile}/>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.searchOutline}>
                  <div className={styles.returnText} onClick={() => setShowSearch(false)}>
                    {lang == "en" ? langData.returnOutline[0] : langData.returnOutline[1]}
                  </div>
                  <div>
                    {!searchKeywordResult?.[0]?.fileDetails?.length ?
                      <div>
                        {lang == "en" ? langData.noSearchList[0] : langData.noSearchList[1]}
                      </div> :
                      <div style={{marginBottom:"20px"}}>
                        {searchKeywordResult?.[0]?.fileDetails?.map((a, i) => {
                          // ✅ 경로 가공 로직
                          const filePathArray = a.filePath
                            ?.replace(/^\/?data\//, '') // 맨 앞의 /data/ 제거
                            ?.replace(/\.html$/, '') // .html 제거
                            ?.split('/') // / 기준으로 분리
                            ?.filter(Boolean); // 빈 문자열 제거
                            
                          return (
                            <div key={i} className={styles.searchResultWrapper} onClick={()=>{
                              handleFileClick(a.filePath);
                            }}>
                              <div className={styles.titleText}>
                                {a.title}
                              </div>
                              <div className={styles.searchResultPath}>
                              {filePathArray.map((part, index) => (
                                <div key={index} className={styles.filePathText2}>
                                  {part}
                                  {index < filePathArray.length - 1 && (
                                    <span style={{ margin: "0 4px" }}>{">"}</span>
                                  )}
                                </div>
                              ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    }
                  </div>
                </div>

              </div>
            </div>

          </div>
          
        </div>

        <div className={styles.centerBarWrapper}>
          <div>
            {isNavigateOpen && (
              <HtmlPopup html={navigateHtml} isNavigateOpen={isNavigateOpen} setNavigateOpen={setNavigateOpen}></HtmlPopup>
            )}
          </div>
          {
            htmlContent == '' ? 
            <div className={styles.notHtmlYet} style={{paddingTop:"30px"}}>
              {lang == "en" ? langData.notHtml[0] : langData.notHtml[1]}
            </div> : 
            <div className='flex' style={{flexDirection:"column"}}>
              <div className={styles.filePathWrapper}>
                <div>
                  {filePath.map((part, index) => (
                    <div key={index} className={styles.filePathText}>
                      {part}
                      {index < filePath.length - 1 && (
                        <span style={{ margin: "0 4px" }}>{">"}</span>
                      )}
                    </div>
                  ))}
                </div>
                <img src='/copy.png' width="24" className='pointer' onClick={() => {
                  const textToCopy = filePath.join(" > ");
                  navigator.clipboard.writeText(textToCopy);
                  alert(lang == "en" ? langData.copyPath[0] : langData.copyPath[1]);
                }}/>
              </div>
              <div className={styles.htmlWrapper} style={{ overflowY: 'scroll' }} id="content">
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
          { htmlContent == '' ?
            <div className={styles.notHtmlYet}>
              {lang == "en" ? langData.notHtml[0] : langData.notHtml[1]}
            </div> :
            <div style={{marginBottom:"20px", paddingLeft:"20px"}}>
              <div className={styles.currentDocu}>
                <div className={styles.currentText}>
                  {lang == "en" ? langData.current[0] : langData.current[1]}
                </div>
                <div className={styles.rightIconWrapper}>
                  <div className={styles.iconWrapper}>
                    <img src='/download.png' height="22px"/>
                    <div className={styles.iconText}>PDF</div>
                  </div>
                  <div className={styles.iconWrapper} onClick={handleDownload}>
                    <img src='/history.png' height="22px"/>
                    <div className={styles.iconText}>{lang == "en" ? "History" : "계산기록"}</div>
                  </div>
                </div>
              </div>
              
              <div style={{marginBottom:"20px", display:"inline-block"}}>
                {
                  !isBookmarkHere ? 
                  <div className={styles.bookmarkWrapper2} onClick={handleBookmarkAdd}>
                    <img src='/bookmark1.png' height="18px"/>
                    <div className={styles.addBookmark}>
                      {lang == "en" ? "Add Bookmark" : "북마크 추가"}
                    </div>
                  </div> :
                  <div className={styles.bookmarkWrapper2} onClick={()=>handleBookmarkRemove(selectedFile)}>
                    <img src='/bookmark2.png' height="18px"/>
                    <div className={styles.removeBookmark}>
                      {lang == "en" ? "Remove Bookmark" : "북마크 제거"}
                    </div>
                  </div> 
                }
              </div>
              <div style={{marginBottom:"20px"}}>
                <div className={styles.updateText}>{lang == "en" ? langData.updateDate[0] : langData.updateDate[1]} {updateDate}</div>
                <div className={styles.currentPath}>
                  {currnetFilePath.map((a, i) => {
                    return (
                      <div key={i}>{a}</div>
                    )
                  })}
                </div>
              </div>
              <div>
                <div className={styles.memoText}>
                  {lang == "en" ? langData.memo[0] : langData.memo[1]}
                </div>
                <div className='flex' style={{flexDirection:"column", alignItems:"flex-end"}}>
                  <div>
                    <textarea className={styles.memoInput} placeholder={lang == "en" ? langData.memoPlace[0] : langData.memoPlace[1]} value={memo} type='text' onChange={(e)=>{setMemo(e.target.value)}}/>
                  </div>
                  <div className={styles.memoWrapper}>
                    <div className={styles.deleteMemoText} onClick={handleDeleteMemo}>{lang == "en" ? langData.deleteMemo[0] : langData.deleteMemo[1]}</div>
                    <button className={styles.memoBtn} onClick={handleSubmitMemo}>
                      {lang == "en" ? "Save" : "저장"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
          <div className={styles.announceWrapper}>
            <div className={styles.nofiText}>
              {lang == "en" ? "Announcement" : "공지사항"}
            </div>
            <div className={styles.announceText}>
              {lang == "en" ? langData.announce[0] : langData.announce[1]}
            </div>
            <div className={styles.policyWrapper} onClick={()=>{setTerms(!terms)}}>
              <div style={{color:"#0066ff"}}>{lang == "en" ? langData.policy[0] : langData.policy[1]}</div>
              <div>|</div>
              <div>ⓒ Class Rules</div>
            </div>
          </div>
          <div className={styles.feedback} onClick={()=>{setFeedback(!feedback)}}>
            {lang == "en" ? langData.feedback[0] : langData.feedback[1]}
          </div>
        </div>
      </div>
    </div>
  )
}