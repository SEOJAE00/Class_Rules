'use client'

import React, { useState } from 'react';
import styles from "../css/fileTree.module.css"

// 4. 'selectedFile' prop을 새로 받습니다.
export default function FileTreeView({ data, onFileClick, level = 0, isLastFile = false, selectedFile }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFolder = () => {
        setIsOpen(!isOpen);
    };

    const handleFileClick = () => {
        if (data.type === "file") {
            onFileClick(data.path); // 클릭 시 부모의 state를 업데이트
        }
        //console.log(data.path)
    };

    // 6. isSelected 로직 수정:
    // 이 파일의 경로(data.path)가 부모로부터 받은 '선택된 파일' 경로(selectedFile)와 일치하는지 확인
    let isSelected = data.type === 'file' && data.path === selectedFile;

    return (
        <div>
            {/* 폴더/파일 */}
            <div
                onClick={data.type === "folder" ? toggleFolder : handleFileClick}
                style={{ cursor: "pointer", marginLeft: `${level * 20}px` }}
            >
                {data.type === "folder" ? (
                    <div className={styles.folderWrapper}>
                        <img src='/folder.png' height="20"/>
                        <div className={styles.textWrap}>{data.name}</div>
                    </div>
                ) : (
                    <div className={`${styles.fileWrapper} ${isSelected ? styles.yesIsselect : styles.noIsselect}`} style={{marginLeft:`${level * -20}px`, paddingLeft:`${level * 20}px`}}>
                        <div>-</div>
                        <div className={styles.textWrap2}>{data.name}</div>
                    </div>
                )}
            </div>

            {isOpen && data.children && (
                <div style={{marginBottom:'10px'}}>
                    {data.children.map((child, index) => (
                        <FileTreeView
                            key={child.name}
                            data={child}
                            onFileClick={onFileClick}
                            level={level + 1}
                            isLastFile={child.type === 'file' && index === data.children.length - 1}
                            selectedFile={selectedFile}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}