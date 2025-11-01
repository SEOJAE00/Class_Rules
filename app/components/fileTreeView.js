import React, { useState } from 'react';

export default function FileTreeView({ data, onFileClick }) { // onFileClick prop을 받아야 함
    const [isOpen, setIsOpen] = useState(false);

    const toggleFolder = () => {
        setIsOpen(!isOpen);
    };

    const handleFileClick = () => {
        if (data.type === "file") {
            onFileClick(data.path); // 파일 경로를 상위 컴포넌트로 전달
        }
    };

    return (
        <div className="tree-node">
            <div
                className={`node-label ${data.type === "folder" ? "folder-label" : "file-label"}`}
                onClick={data.type === "folder" ? toggleFolder : handleFileClick}
                style={{ cursor: "pointer" }}
            >
                {data.type === "folder" ? (
                    <span>{isOpen ? "📂" : "📁"} {data.name}</span>
                ) : (
                    <span>- {data.name}</span>
                )}
            </div>

            {isOpen && data.children && (
                <div className="node-children">
                    {data.children.map(child => (
                        <FileTreeView key={child.name} data={child} onFileClick={onFileClick} />
                    ))}
                </div>
            )}
        </div>
    );
}