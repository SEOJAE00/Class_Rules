'use client'

import { useState } from 'react';
import styles from "./page.module.css";
import langData from "./system/lang.json"

export default function Home() {
  //시작 언어를 영어로 설정
  let [lang, setLang] = useState("en");

  return (
    <div className={styles.page}>
      {lang == "en" ? langData.login[0] : langData.login[1]}
    </div>
  );
}
