'use client'

import { useState } from 'react';
import Header from '../components/header';
import { useLang } from "../context/LangContext";
import styles from "../css/searchP.module.css"

export default function Search() {

  const { lang, toggleLang } = useLang();
  
  // 로딩
  let [loading, setLoading] = useState(false);

  return (
    <div>
      <Header/>
      Search
    </div>
  )
}