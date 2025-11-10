'use client'

import { useEffect, useState } from 'react';
import styles from "./page.module.css";
import langData from "./system/lang.json";
import { useLang } from "./context/LangContext";
import Terms from './components/terms';
import axios from 'axios';
import Loading from './components/loading';
import { useRouter } from 'next/navigation';

export default function Home() {

  // 토큰이 있으면 바로 /viewer로 이동
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/viewer");
    }
  }, []);

  let router = useRouter();
  
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

  // 로딩
  let [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const response = await axios.post("/api/proxy/api/auth/login", {
        email : loginEmail,
        password : loginPassword,
      }, {
        headers: { "Content-Type": "application/json" }
      });
      const token = response.data.token;
      localStorage.setItem("token", token);
      alert(lang == "en" ? "Log In Successful" : "로그인에 성공했습니다");
      router.push("/viewer");
    } catch (error) {
      console.error("로그인 오류:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
      }
      alert(lang == "en" ? "Please check your email and password" : "이메일과 비밀번호를 확인해주세요");
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 관련 인풋
  let [signupName, setSignupName] = useState("");
  let [birth, setBirth] = useState("");
  let [company, setCompany] = useState("");
  let [job, setJob] = useState("");
  let [signupEmail, setSignupEmail] = useState("");
  let [signupPassword, setSignupPassword] = useState("");
  let [confirmPassword, setConfirmPassword] = useState("");
  
  // 이메일 형식 검사 정규식, 함수
  let [signupEmailCK, setSignupEmailCK] = useState(true);
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setSignupEmail(value);
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    setSignupEmailCK(regex.test(value) || value === "");
  };
  
  // 생년월일 형식 검사 0000-00-00, 함수
  let [birthCK, setBirthCK] = useState(true);
  const handleBirthChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자 외 제거
    // 입력한 숫자 길이에 따라 자동으로 '-' 삽입
    if (value.length > 4 && value.length <= 6) {
      value = value.slice(0, 4) + "-" + value.slice(4);
    } else if (value.length > 6) {
      value = value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6, 8);
    }
    setBirth(value);
    const regex = /^(19(2[5-9]|[3-9]\d)|20(0\d|1\d|2[0-5]))-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    setBirthCK(regex.test(value) || value === "");
  };
  
  // 비밀번호 형식 검사: 8~16자, 영어(대소문자 무관) + 숫자 + 특수문자 포함, 함수
  let [signupPasswordCK, setSignupPasswordCK] = useState(true);
  let [wrongPasswordPop, setWrongPasswordPop] = useState(false);

  const handlePasswordChange = (e) => {
    let value = e.target.value;
    setSignupPassword(value);
    const regex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|\\:;"'<>,.?/])[a-zA-Z\d!@#$%^&*()_+\-={}[\]|\\:;"'<>,.?/]{8,16}$/;
    setSignupPasswordCK(regex.test(value) || value === "");
  };
  const confirmedPassword = signupPassword == confirmPassword;

  // 회원가입 함수, 실제 베포 시 API url 숨겨야 함
  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/proxy/api/auth/register", {
        name : signupName,
        birth : birth,
        company : company,
        job : job,
        email : signupEmail,
        password : signupPassword
      }, {
        headers: { "Content-Type": "application/json" }
      });
      alert(lang == "en" ? "Sign Up Successful" : "회원가입에 성공했습니다");
      window.location.reload();
    } catch (error) {
      console.error("회원가입 오류:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
      }
      alert(lang == "en" ? "Sign Up failed" : "회원가입에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const isSignupCK = signupName !== "" && birth !=="" && company !=="" && job !=="" && signupEmail !=="" && signupPassword !=="" && confirmPassword !=="" && signupEmailCK && birthCK && signupPasswordCK && confirmedPassword;
  
  if (lang === null) {
    return null; // 또는 로딩 스피너 넣기
  } 

  return (
    <div className={styles.wrapper}>
      {terms ? <Terms setTerms={setTerms}/> : null}
      {loading ? <Loading setLoading={setLoading}/> : null}
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
                <div className={styles.langBoxArrow}><img src='/down.png' height={16}/></div>
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
          <div className={`${styles.wrongPassword} ${wrongPasswordPop ? styles.wrongPasswordOn : styles.wrongPasswordOff}`} onClick={()=>setWrongPasswordPop(false)} style={lang == "en" ? {right:"20px", bottom:"299px"} : {right:"22px", bottom:"299px"}}>{lang == "en" ? langData.wrongPassword[0] : langData.wrongPassword[1]}</div>
          <div>
            <div className={styles.loginWrapper}>
              <div className={styles.loginTo}>{lang == "en" ? langData.signup[0] : langData.signup[1]}</div>
              <div className='login-logo'>Class <span>Rules</span></div>
            </div>
            <div className='grayText wrapText line-24'>{lang == "en" ? langData.signupDes[0] : langData.signupDes[1]}</div>
            <div className={styles.langWrap}>
              <div onClick={langBoxForm} className={langBoxCK == false ? styles.changeLangBox : styles.changeLangBox2}>
                <div className={styles.langBoxText}>{lang == "en" ? "English" : "한국어"}</div>
                <div className={styles.langBoxArrow}><img src='/down.png' height={16}/></div>
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
            <div>
              <div className={styles.loginEmailText}>{lang == "en" ? langData.birth[0] : langData.birth[1]}<span>*</span>
                <div className={styles.birthEx}>{lang == "en" ? langData.birthEx[0] : langData.birthEx[1]}</div>
              </div>
              <input type='text' value={birth} onChange={handleBirthChange} className={`${styles.inputStyleSign} ${!birthCK ? styles.wrongType : ""}`}/>
            </div>
            <div>
              <div className={styles.loginEmailText}>{lang == "en" ? langData.company[0] : langData.company[1]}<span>*</span></div>
              <input type='text' value={company} onChange={(e)=>{setCompany(e.target.value)}} className={styles.inputStyleSign}/>
            </div>
            <div>
              <div className={styles.loginEmailText}>{lang == "en" ? langData.job[0] : langData.job[1]}<span>*</span></div>
              <input type='text' value={job} onChange={(e)=>{setJob(e.target.value)}} className={styles.inputStyleSign}/>
            </div>
            <div>
              <div className={styles.loginEmailText}>{lang == "en" ? langData.email[0] : langData.email[1]}<span>*</span>
                {!signupEmailCK ? <div className={styles.birthEx}>{lang == "en" ? langData.emailError[0] : langData.emailError[1]}</div> : null}
              </div>
              <input type='text' value={signupEmail} onChange={handleEmailChange} className={`${styles.inputStyleSign} ${!signupEmailCK ? styles.wrongType : ""}`}/>
            </div>
            <div>
              <div className='flex flexAlignCenter posiRela'>
                <div className={styles.loginEmailText}>{lang == "en" ? langData.password[0] : langData.password[1]}<span>*</span>
                </div>
                <img src='/wrongNofi.png' width="16" style={{marginLeft:"6px"}} onClick={()=>setWrongPasswordPop(!wrongPasswordPop)}/>
              </div>
              <input type='password' maxLength={16} value={signupPassword} onChange={handlePasswordChange} className={`${styles.inputStyleSign} ${!signupPasswordCK ? styles.wrongType : ""}`}/>
            </div>
            <div>
              <div className={styles.loginEmailText}>{lang == "en" ? langData.confirmPassword[0] : langData.confirmPassword[1]}<span>*</span>
                <div className={styles.notMatch}>{confirmedPassword ? "" : lang == "en" ? "Do not match" : "비밀번호 불일치" }</div>
              </div>
              <input type='password' maxLength={16} value={confirmPassword} onChange={(e)=> setConfirmPassword(e.target.value)} className={`${styles.inputStyleSign} ${!confirmedPassword ? styles.wrongType : ""}`}/>
            </div>
            <div className={styles.signupForm}>
              <div className='flex flexAlignCenter'>
                <div className={styles.createAccount} onClick={()=>setLogSign("login")}>{lang == "en" ? langData.loginBtn[0] : langData.loginBtn[1]}</div>
                <button className={`${styles.signupBtn} ${!isSignupCK ? styles.loginBtnDisabled : styles.loginBtnActive}`} disabled={!isSignupCK} onClick={handleRegister}>{lang == "en" ? langData.signupBtn[0] : langData.signupBtn[1]}</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  );
}
