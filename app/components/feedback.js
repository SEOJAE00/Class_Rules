'use client'

import styles from "../css/feedback.module.css"

export default function Feedback({ setFeedback }) {
  return (
    <div className={styles.back} onClick={()=>{setFeedback(false)}}>

    </div>
  )
}