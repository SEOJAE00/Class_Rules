'use client'

import { useLang } from "../context/LangContext";
import { useSelectedFile } from '../context/SelectedFileContext';
import styles from "../css/searchP.module.css"
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import langData from "../system/lang.json"
import { useSearchParams } from 'next/navigation'; // 이 훅 때문에 Suspense가 필요합니다.
import AdvancedSearch from '../components/advancedSearch';
import axios from 'axios';

// 기존 Search 컴포넌트의 이름을 SearchContent로 변경합니다.
export default function SearchContent() {

    let router = useRouter();
    const { lang, toggleLang } = useLang();

    // 클릭한 파일 저장할 전역 스테이트
    const { setSelectedFilePath, setSociNumber } = useSelectedFile();
    
    // 로딩
    let [loading, setLoading] = useState(false);

    let soci = ["KOREAN REGISTER(en)", "KOREAN REGISTER(kr)", "American Bureau of Shipping", "BUREAU VERITAS", "Det Norske Veritas", "Lloyd's Register", "Nippon Kaiji Kyokkai"];
    let sociColor = ["#0085ca", "#0085ca", "#0e294c", "#7e190c", "#0f214a", "#00a99d", "#2d5ea3"];
    let sociAPI = ["KR", "KRko", "ABS", "BV", "DNV", "LR", "NK"];
    //let sociNum = [1, 3, 4, 6, 2, 5, 7];
    let sociNum = [4, 5, 1, 2, 6, 3, 7];
    let [onSelected, setOnSelected] = useState(0);
    let [goSociNum, setGoSociNum] = useState(sociNum[0]);
    let [selectedFile, setSelectedFile] = useState(null);

    // useSearchParams를 이 컴포넌트 내부에서 사용합니다.
    const searchParams = useSearchParams();
    const keywords = searchParams.getAll('keyword'); 

    const payload = { words: keywords };
    const [searchResult, setSearchResult] = useState([]);

    const sendSearchData = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch('/api/proxy/api/multisearch', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`서버 오류: ${response.status}`);
            }

            const data = await response.json();
            setSearchResult(data);
            console.log(data)
        } catch (err) {
            console.error('전송 오류:', err);
        }
    };

    useEffect(()=>{
        sendSearchData();
        fetchBookmark();
    }, [searchParams]) // searchParams가 변경될 때마다 재실행

    useEffect(() => {
        const keywords = searchParams.getAll("keyword");

        if (keywords.length > 0) {
            const formatted = keywords.join(", ") + " ";
            setInputValue(formatted);
        }
    }, [searchParams]);

    // 로그아웃 함수
    let handleLogout = () => {
        localStorage.removeItem("token");
        alert(lang == "en" ?langData.logoutAlert[0] :langData.logoutAlert[1])
        router.replace("/");
    };

    let [bookmark, setBookmark] = useState([]);

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

    let handleBookmarkAdd = async (filePath, currntShipNum) => {
        try {
            const token = localStorage.getItem("token"); // 토큰 가져오기
            const response = await axios.post(
                "/api/proxy/api/bookmark",
                {
                    shipClass: currntShipNum,
                    filePath: filePath,
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


    // 검색 관련 스테이트, 함수
    let [inputValue, setInputValue] = useState(""); // 인풋값
    let [searchKeyword, setSearchKeyword] = useState([]); // 분리된 키워드 배열
    let separateKeyword = () => {
        if (!inputValue) return;
        const result = inputValue.split(",").map((item) => item.trim()).filter((item) => item !== "");
        setSearchKeyword(result);
        console.log(result);
        const queryString = result.map((r) => `keyword=${encodeURIComponent(r)}`).join("&");
        // window.location.href 대신 router.push를 사용하여 클라이언트 측 라우팅을 유지합니다.
        router.push(`/search?${queryString}`); 
    };
    let handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            separateKeyword();
        }
    };

    const filteredResult = useMemo(() => {
        if (onSelected === 0) {
            return searchResult;
        }
        return searchResult.filter(item => Number(item.shipClass) === onSelected);
    }, [searchResult, onSelected]);

    useEffect(()=>{
        console.log(onSelected)
    }, [onSelected])

    let [advancedPop, setAdvancedPop] = useState(false);

    if (lang === null) {
        return null; // 또는 로딩 스피너 넣기
    }

    // JSX 반환 (이 부분은 동일하게 유지)
    return (
        <div className={styles.viewerContainer}>
            <div style={{zIndex:"9999"}}>
                {advancedPop ? <AdvancedSearch advancedPop={advancedPop} setAdvancedPop={setAdvancedPop}/> : null}
            </div>

            <div className={styles.headerContainer}>
                <div className={styles.headerLeftWrapper}>
                    <img src='/logo.png' style={{cursor:"pointer"}} width={142} onClick={()=>{window.location.assign("/viewer");}}></img>
                    <div className='flex flexAlignCenter'>
                        <div onClick={toggleLang} className={styles.langToggle}><div style={{color:lang == "en" ? "#0066ff" : ""}}>En</div><div>/</div><div style={{color:lang == "en" ? "" : "#0066ff"}}>Ko</div>
                        </div>
                        <button onClick={handleLogout} className={styles.logoutBtn}>
                            {lang == "en" ? langData.logout[0] : langData.logout[1]}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.bodyWrapper}>

                <div className={styles.leftBarWrapper}>
                    <div className={styles.leftBarsoci}>
                        <div className={styles.soci}>
                            {lang == "en" ? langData.soci[0] : langData.soci[1]}
                        </div>
                        <div className={styles.sociDes}>
                            {lang == "en" ? langData.sociDes[0] : langData.sociDes[1]}
                        </div>
                    </div>

                    <div className={styles.sociWrapper}>
                        <div className={`${styles.selectSoci} ${onSelected == 0 ? styles.onActiveSoci : ""}`} style={{ fontWeight: "600" }} onClick={()=>{setOnSelected(0)}}>
                            {lang == "en" ? "All Classification Societies" : "모든 선급 기관"}
                        </div>
                        {
                            soci.map((a, i)=>{
                                return (
                                    <div className={`${styles.selectSoci} ${onSelected == sociNum[i] ? styles.onActiveSoci : ""}`} key={i} onClick={()=>{
                                        setOnSelected(sociNum[i]);
                                        setGoSociNum(sociNum[i]);
                                    }}> 
                                        <img src={`/sociCover/${a}.png`} style={{height:"19px"}}/>
                                        <div className={styles.sociText} style={{color:sociColor[i]}}>{a}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

                <div className={styles.centerBarWrapper}>
                    <div className={styles.searchBox}>
                        <div className={styles.searchText}>
                            {lang == "en" ? langData.searchPlace[0] : langData.searchPlace[1]}
                        </div>
                        
                        <div className={styles.searchInputBox}>
                            <div className={styles.inputWrapper}>
                                <input className={styles.searchInput} type='text' value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}/>
                                <div onClick={separateKeyword}><img src='/search.png' className={styles.searchIcon}/></div>
                            </div>
                            <button className={styles.adSearchBtn} onClick={()=>setAdvancedPop(!advancedPop)}>
                            {lang == "en" ?langData.advancedSearch[0] :langData.advancedSearch[1]}
                            </button>
                        </div>
                    </div>

                    <div style={{marginLeft:'30px'}}>
                        {
                            filteredResult.map((a) => {
                                const classId = Number(a.shipClass);
                                const sociIndex = sociNum.indexOf(classId);

                                if (sociIndex === -1) return null;

                                const sociName = soci[sociIndex];
                                const color = sociColor[sociIndex];

                                const bookmarkGroup = bookmark.find(b => b.shipClass === a.shipClass);
                                const currntShipNum = a.shipClass;

                                return (
                                    <div key={a.shipClass} style={{marginBottom:'30px'}}>
                                        <div className='flex' style={{alignItems:'center', marginBottom:'20px'}}>
                                            <img src={`/sociCover/${sociName}.png`} style={{height:"21px"}}/>
                                            <div className={styles.sociText} style={{color: color}}>{sociName}</div>
                                            <div className={styles.resultText}>
                                                {lang == "en" ? "Result" : "결과"} {a.fileDetails.length}
                                            </div>
                                        </div>
                                        {
                                            a.fileDetails.map((fileDetails, i)=>{
                                                let isBookmarkHere = false;
                            
                                                if (bookmarkGroup) {
                                                    isBookmarkHere = bookmarkGroup.fileDetails.some(
                                                        bookmarkedFile => bookmarkedFile.filePath === fileDetails.filePath
                                                    );
                                                }

                                                const filePathArray = fileDetails.filePath
                                                    ?.replace(/^\/?data\//, '') // 맨 앞의 /data/ 제거
                                                    ?.replace(/\.html$/, '') // .html 제거
                                                    ?.split('/') // / 기준으로 분리
                                                    ?.filter(Boolean); // 빈 문자열 제거

                                                return (
                                                    <div key={i} className={styles.resultBox}>
                                                        <div className={styles.resultTextWrapper}>
                                                            <div className={styles.titleText} onClick={()=>{
                                                                setSociNumber(currntShipNum);
                                                                setSelectedFilePath(fileDetails.filePath);
                                                                router.push('/viewer');
                                                            }}>{fileDetails.title}</div>
                                                            {
                                                                !isBookmarkHere ? 
                                                                <div className={styles.bookmarkWrapper2} onClick={()=>handleBookmarkAdd(fileDetails.filePath, currntShipNum)}>
                                                                    <img src='/bookmark1.png' height="18px"/>
                                                                    <div className={styles.addBookmark}>
                                                                        {lang == "en" ? "Add Bookmark" : "북마크 추가"}
                                                                    </div>
                                                                </div> :
                                                                <div className={styles.bookmarkWrapper2} onClick={()=>handleBookmarkRemove(fileDetails.filePath)}>
                                                                    <img src='/bookmark2.png' height="18px"/>
                                                                    <div className={styles.removeBookmark}>
                                                                        {lang == "en" ? "Remove Bookmark" : "북마크 제거"}
                                                                    </div>
                                                                </div> 
                                                            }
                                                        </div>
                                                        <div style={{margin:"10px 0 14px 0"}}>
                                                            {filePathArray.map((part, index) => (
                                                                <div key={index} className={styles.filePathText2}>
                                                                    {part}
                                                                    {index < filePathArray.length - 1 && (
                                                                        <span style={{ margin: "0 4px" }}>{">"}</span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className={styles.contentsText}>{fileDetails.text}</div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>

                </div>
            </div>
        </div>
    )
}