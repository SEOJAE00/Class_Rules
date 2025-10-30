'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react'
import langData from "../system/lang.json"
import { useLang } from "../context/LangContext";
import styles from "../css/viewer.module.css"

export default function Viewer() {

  let router = useRouter();

  const { lang, toggleLang } = useLang();

  // 토큰이 없으면 바로 /로 이동
  useEffect(() => {
    if (lang === null) return;
    const token = localStorage.getItem("token");
    if (!token) {
      alert(lang == "en" ? "Login is required" : "로그인이 필요합니다");
      router.replace("/");
    }
  }, [lang]);
    
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