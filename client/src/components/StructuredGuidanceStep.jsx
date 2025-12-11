import React from 'react';
import '../styles/StructuredGuidanceStep.css';

/**
 * 구조화된 가이드 단계 컴포넌트
 * 긴 텍스트를 구조화하여 보기 쉽게 표시
 */
const StructuredGuidanceStep = ({ step }) => {
    // content가 구조화된 객체인지 확인
    const isStructured = typeof step.content === 'object' && step.content !== null;

    if (isStructured) {
        const { sections, items, notes } = step.content;

        return (
            <div className="structured-step-content">
                {/* 섹션별 내용 (Step 4는 동적 데이터만 표시하므로 섹션 숨김) */}
                {step.step !== 4 && sections && Array.isArray(sections) && sections.length > 0 && (
                    <div className="guidance-sections">
                        {sections.map((section, idx) => (
                            <div key={idx} className="guidance-section">
                                {section.title && (
                                    <h5 className="section-title">
                                        <span className="material-icons-round">{section.icon || 'check_circle'}</span>
                                        {section.title}
                                    </h5>
                                )}
                                {section.items && Array.isArray(section.items) && (
                                    <ul className="section-items">
                                        {section.items.map((item, itemIdx) => {
                                            const isString = typeof item === 'string';
                                            const isObject = typeof item === 'object' && item !== null;
                                            const label = isObject ? (item.label || item.title || item.key) : null;
                                            const text = isObject ? (item.text || item.value || item.desc || item.content) : null;

                                            return (
                                                <li key={itemIdx}>
                                                    {isString ? item : (
                                                        <>
                                                            {label && <strong>{label}: </strong>}
                                                            {text}
                                                        </>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                                {section.text && (
                                    <p className="section-text">{section.text}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 번호 목록 */}
                {items && Array.isArray(items) && items.length > 0 && (
                    <ol className="guidance-items">
                        {items.map((item, idx) => {
                            const isString = typeof item === 'string';
                            const isObject = typeof item === 'object' && item !== null;
                            const title = isObject ? (item.title || item.label || item.key) : null;
                            const text = isObject ? (item.text || item.value || item.desc || item.content) : null;

                            return (
                                <li key={idx}>
                                    {isString ? item : (
                                        <>
                                            {title && <strong>{title}</strong>}
                                            {text && <span>{text}</span>}
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                )}

                {/* 참고 사항 */}
                {notes && Array.isArray(notes) && notes.length > 0 && (
                    <div className="guidance-notes">
                        <h5 className="notes-title">
                            <span className="material-icons-round">note</span>
                            참고 사항
                        </h5>
                        <ul className="notes-list">
                            {notes.map((note, idx) => (
                                <li key={idx}>{note}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    // 기존 텍스트를 자동으로 구조화 (Fallback)
    const autoStructure = (rawText) => {
        if (!rawText) return null;
        const text = String(rawText);

        // 번호나 불릿 포인트 패턴 찾기
        const numberedPattern = /(\d+[\.\)]\s*[^\d\n]+)/g;
        const bulletPattern = /[•·▪▫]\s*([^\n]+)/g;

        const numberedMatches = text.match(numberedPattern);
        const bulletMatches = text.match(bulletPattern);

        // 번호 목록이 있으면 구조화
        if (numberedMatches && numberedMatches.length > 0) {
            return (
                <ol className="auto-structured-list">
                    {numberedMatches.map((item, idx) => (
                        <li key={idx}>{item.replace(/^\d+[\.\)]\s*/, '')}</li>
                    ))}
                </ol>
            );
        }

        // 불릿 포인트가 있으면 구조화
        if (bulletMatches && bulletMatches.length > 0) {
            return (
                <ul className="auto-structured-list">
                    {bulletMatches.map((item, idx) => (
                        <li key={idx}>{item.replace(/^[•·▪▫]\s*/, '')}</li>
                    ))}
                </ul>
            );
        }

        // 문장 단위로 나누기 (마침표 기준)
        const sentences = text.split(/[\.。]\s+/).filter(s => s.trim().length > 0);
        if (sentences.length > 3) {
            return (
                <ul className="auto-structured-list">
                    {sentences.map((sentence, idx) => (
                        <li key={idx}>{sentence.trim()}{idx < sentences.length - 1 ? '.' : ''}</li>
                    ))}
                </ul>
            );
        }

        // 기본: 문단으로 표시
        return <p className="step-content-text">{text}</p>;
    };

    return (
        <div className="step-content">
            {autoStructure(step.content)}
        </div>
    );
};

export default StructuredGuidanceStep;
