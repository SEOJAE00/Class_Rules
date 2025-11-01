import langData from "../system/lang.json"
import { useLang } from "../context/LangContext";
import styles from "../css/shipNum.module.css"

export default function ShipNum({shipNumPop, setShipNumPop}) {

  // 언어 변경 함수 전역 콘텍스트
  const { lang, toggleLang } = useLang();

  return (
    <div className={styles.back} onClick={()=>setShipNumPop(!shipNumPop)}>

    </div>
  )
}