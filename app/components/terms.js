import styles from "./terms.module.css";
import langData from "../system/lang.json"
import { useLang } from "../context/LangContext";

export default function Terms({ setTerms }) {

  // 언어 변경 함수 전역 콘텍스트
  const { lang, toggleLang } = useLang();

  return (
    <div className={styles.back} onClick={()=>setTerms(false)}>
      
    </div>
  )
}