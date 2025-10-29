'use client'

import { useEffect, useState } from 'react';
import styles from "./page.module.css";
import langData from "./system/lang.json"
import { useLang } from "./context/LangContext";
import Terms from './components/terms';
import axios from 'axios';

export default function Home() {
  
  // 언어 변경 함수 전역 콘텍스트
  const { lang, toggleLang } = useLang();
  
  // 언어 변경 박스 관련
  let [langBoxCK, setLangBoxCK] = useState(false);
  let langBoxForm = () => {
    if(!langBoxCK) {
      setLangBoxCK(true);
    } else {
      setLangBoxCK(false);
    }
  };

  // 로그인 / 회원가입 분리 스테이트
  let [logSign, setLogSign] = useState('login');
  // 정책 팝업 관리
  let [terms, setTerms] = useState(false);

  // 로그인 관련 인풋 값들
  let [loginEmail, setLoginEmail] = useState("");
  let [loginPassword, setLoginPassword] = useState("");
  let [passwordVisible, setPasswordVisible] = useState(false);
  const isActiveCK = loginEmail !== "" && loginPassword !=="";

  // 로그인 함수, 실제 베포 시 API url 숨겨야 함
  const handleLogin = async () => {
    try {
      const response = await axios.post("https://marinedocs.kro.kr/api/proxy/api/auth/login", {
        email : loginEmail,
        password : loginPassword,
      }, {
        headers: { "Content-Type": "application/json" }
      });
      const token = response.data.token;
      localStorage.setItem("token", token);
      alert(lang == "en" ? "Log In Successful" : "로그인에 성공했습니다");
    } catch (error) {
      console.error("로그인 오류:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
      }
      alert(lang == "en" ? "Please check your email and password" : "이메일과 비밀번호를 확인해주세요");
    }
  };

  // 회원가입 관련 인풋
  let [signupName, setSignupName] = useState("");
  
  if (lang === null) {
    return null; // 또는 로딩 스피너 넣기
  } 

  return (
    <div className={styles.wrapper}>
      {terms ? <Terms setTerms={setTerms}/> : null}
      {
        logSign == "login" ?
        <div className={styles.loginPage}>
          <div>
            <div className={styles.loginWrapper}>
              <div className={styles.loginTo}>{lang == "en" ? langData.login[0] : langData.login[1]}</div>
              <div className='login-logo'>Class <span>Rules</span></div>
            </div>
            <div className='grayText wrapText line-24'>{lang == "en" ? langData.loginDes[0] : langData.loginDes[1]}</div>
            <div className={styles.langWrap}>
              <div onClick={langBoxForm} className={langBoxCK == false ? styles.changeLangBox : styles.changeLangBox2}>
                <div className={styles.langBoxText}>{lang == "en" ? "English" : "한국어"}</div>
                <div className={styles.langBoxArrow}>▼</div>
                <div onClick={toggleLang} className={`${styles.langBoxText2} ${!langBoxCK ? styles.active : ""}`}><span>{lang == "en" ? "한국어" : "English"}</span></div>
              </div>
              <div className={styles.terms} onClick={()=>{setTerms(true)}}>{lang == "en" ? langData.policy[0] : langData.policy[1]}</div>
            </div>
          </div>

          <div className={styles.loginFormWrapper}>
            <div>
              <div className={styles.loginEmailText}>{lang == "en" ? langData.email[0] : langData.email[1]}</div>
              <input type='text' value={loginEmail} onChange={(e)=>{setLoginEmail(e.target.value)}} className={styles.inputStyle}/>
            </div>
            <div style={{marginTop:"20px"}}>
              <div className={styles.loginEmailText}>{lang == "en" ? langData.password[0] : langData.password[1]}</div>
              <input type={passwordVisible ? "text" : "password"} value={loginPassword} onChange={(e)=>{setLoginPassword(e.target.value)}} className={styles.inputStyle}/>
              <div className={styles.passwordVisibleIcon} onClick={()=>setPasswordVisible(!passwordVisible)}>{passwordVisible ? <img src='/eyeOpen.png' style={{width:"24px", height:"24px"}}/> : <img src='/eyeClosed.png' style={{width:"24px", height:"24px"}}/>}</div>
            </div>
            <div className='flex' style={{justifyContent:'space-between', margin:'73px 0 20px 0'}}>
              <div className={styles.forgotPass}>{lang == "en" ? langData.forgot[0] : langData.forgot[1]}</div>
              <div className={styles.createAccount} onClick={()=>{setLogSign("signup")}}>{lang == "en" ? langData.create[0] : langData.create[1]}</div>
            </div>
            <button className={`${styles.loginBtn} ${!isActiveCK ? styles.loginBtnDisabled : styles.loginBtnActive}`} disabled={!isActiveCK} onClick={handleLogin}>{lang == "en" ? langData.loginBtn[0] : langData.loginBtn[1]}</button>
          </div>
        </div>
        :
        <div className={styles.loginPage}>
          <div>
            <div className={styles.loginWrapper}>
              <div className={styles.loginTo}>{lang == "en" ? langData.signup[0] : langData.signup[1]}</div>
              <div className='login-logo'>Class <span>Rules</span></div>
            </div>
            <div className='grayText wrapText line-24'>{lang == "en" ? langData.signupDes[0] : langData.signupDes[1]}</div>
            <div className={styles.langWrap}>
              <div onClick={langBoxForm} className={langBoxCK == false ? styles.changeLangBox : styles.changeLangBox2}>
                <div className={styles.langBoxText}>{lang == "en" ? "English" : "한국어"}</div>
                <div className={styles.langBoxArrow}>▼</div>
                <div onClick={toggleLang} className={`${styles.langBoxText2} ${!langBoxCK ? styles.active : ""}`}><span>{lang == "en" ? "한국어" : "English"}</span></div>
              </div>
              <div className={styles.terms} onClick={()=>{setTerms(true)}}>{lang == "en" ? langData.policy[0] : langData.policy[1]}</div>
            </div>
          </div>

          <div className={styles.signupFormWrapper}>
            <div>
              <div className={styles.loginEmailText}>{lang == "en" ? langData.signupName[0] : langData.signupName[1]}<span>*</span></div>
              <input type='text' value={signupName} onChange={(e)=>{setSignupName(e.target.value)}} className={styles.inputStyleSign}/>
            </div>

          </div>

        </div>
      }
    </div>
  );
}
