'use client'

import { useState } from 'react'
import langData from "../system/lang.json"
import { useLang } from "../context/LangContext";


export default function Viewer() {
  
  const { lang, toggleLang } = useLang();
  
  if (lang === null) {
    return null; // 또는 로딩 스피너 넣기
  }

  return (
    <div>
      home, 깃 푸시 확인용

      {lang == "en" ? langData.policy[0] : langData.policy[1]}
      <button onClick={toggleLang}>Lang Change</button>
      
    </div>
  )
}