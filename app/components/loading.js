import styles from "../css/terms.module.css";
import langData from "../system/lang.json"
import { useLang } from "../context/LangContext";

export default function Loading() {

  // 언어 변경 함수 전역 콘텍스트
  const { lang, toggleLang } = useLang();

  return (
    <div className={styles.back}>
      <span style={{color:"white", fontSize:"40px", fontWeight:"500", zIndex:"9999"}}>{lang == "en" ? "Loading..." : "로딩중..."}</span>
    </div>
  )
}