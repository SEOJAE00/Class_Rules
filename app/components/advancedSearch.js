'use client'

import styles from "../css/advanced.module.css"

export default function AdvancedSearch({advancedPop, setAdvancedPop}) {
  return (
    <div className={styles.back} onClick={()=>setAdvancedPop(!advancedPop)}>
      
    </div>
  )
}