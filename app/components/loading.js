import styles from "../css/terms.module.css";
import langData from "../system/lang.json"
import { useLang } from "../context/LangContext";

export default function Loading() {

  // 언어 변경 함수 전역 콘텍스트
  const { lang, toggleLang } = useLang();

  return (
    <div className={styles.back} style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
      <div className="loadingWrapper">
        <img src="/loading.png" height={60} className="spin" />
        
        <style jsx>{`
          .spin {
            animation: spin 1.5s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
      <div style={{marginTop:'10px'}}>
        <span style={{color:"white", fontSize:"32px", fontWeight:"600", zIndex:"9999"}}>{lang == "en" ? "Loading..." : "로딩중..."}</span>
      </div>
    </div>
  )
}