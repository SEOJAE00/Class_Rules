'use client'

import React, { useState, useEffect } from "react";
import Modal from "react-modal";

// Modal 스타일 설정
const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
        width: "80%",
        maxHeight: "80%",
        overflowY: "auto",
    },
};


export default function HtmlPopup({ html, isNavigateOpen, setNavigateOpen }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen && window.MathJax) {
          // DOM 업데이트 후 MathJax 렌더링 호출
          setTimeout(() => {
            window.MathJax.typesetPromise()
              .catch((err) => console.error("MathJax 렌더링 실패:", err));
          }, 0); // DOM 업데이트를 기다리기 위해 약간의 지연 추가
        }
      }, [isOpen, html]);

    const handleOpenModal = () => {
        // 모달 열기
        setIsOpen(true);
        // document.getElementById("__next").setAttribute("inert", ""); // 배경 비활성화
    };

    const handleCloseModal = () => {
        // 모달 닫기
        setIsOpen(false);
        setNavigateOpen(false);
        // document.getElementById("__next").removeAttribute("inert"); // 배경 활성화
    };

    useEffect(() => {
        Modal.setAppElement("#__next"); // Next.js에서 Modal 사용 시 필수 설정
    }, []);

    useEffect(() => {
        if (isNavigateOpen) {
            handleOpenModal();
        }
    }, [isNavigateOpen])

    return (
        <>
            {/* Modal 컴포넌트 */}
            <Modal
                isOpen={isOpen}
                onRequestClose={handleCloseModal}
                style={customStyles}
                contentLabel="HTML Content Popup"
            >
                {/* 닫기 버튼 */}
                <button onClick={handleCloseModal} style={{ float: "right" }}>
                    닫기
                </button>

                {/* HTML 콘텐츠 표시 */}
                <div dangerouslySetInnerHTML={{ __html: html }} />
            </Modal>
        </>
    );
}
