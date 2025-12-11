import React from 'react';

const PatternInsights = ({ patterns }) => {
    if (!patterns || !patterns.insights || patterns.insights.length === 0) {
        return null;
    }

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return '#ef4444';
            case 'medium':
                return '#f59e0b';
            default:
                return '#6b7280';
        }
    };

    return (
        <div className="pattern-insights">
            <h3>
                <span className="material-icons-round">insights</span>
                행동 패턴 분석
                <span className="pattern-badge">
                    총 {patterns.totalIncidents}건 분석
                </span>
            </h3>

            <div className="insights-grid">
                {patterns.insights.map((insight, index) => (
                    <div
                        key={index}
                        className="insight-card"
                        style={{ borderLeftColor: getSeverityColor(insight.severity) }}
                    >
                        <div className="insight-header">
                            <span className="insight-icon material-icons-round">
                                {insight.type === 'subject' && 'menu_book'}
                                {insight.type === 'time' && 'schedule'}
                                {insight.type === 'location' && 'place'}
                                {insight.type === 'dayOfWeek' && 'calendar_today'}
                                {insight.type === 'incidentType' && 'warning'}
                            </span>
                            <span className="insight-pattern">{insight.pattern}</span>
                        </div>
                        <p className="insight-recommendation">
                            💡 {insight.recommendation}
                        </p>
                    </div>
                ))}
            </div>

            {patterns.patterns && (
                <details className="pattern-details">
                    <summary>상세 패턴 데이터 보기</summary>
                    <div className="pattern-data">
                        {patterns.patterns && patterns.patterns.bySubject && Object.keys(patterns.patterns.bySubject).length > 0 && (
                            <div className="pattern-category">
                                <h4>과목별</h4>
                                <ul>
                                    {Object.entries(patterns.patterns.bySubject)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([subject, count]) => (
                                            <li key={subject}>
                                                {subject}: {count}회
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}

                        {patterns.patterns && patterns.patterns.byTime && Object.keys(patterns.patterns.byTime).length > 0 && (
                            <div className="pattern-category">
                                <h4>시간대별</h4>
                                <ul>
                                    {Object.entries(patterns.patterns.byTime)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([time, count]) => (
                                            <li key={time}>
                                                {time}: {count}회
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}

                        {patterns.patterns && patterns.patterns.byLocation && Object.keys(patterns.patterns.byLocation).length > 0 && (
                            <div className="pattern-category">
                                <h4>장소별</h4>
                                <ul>
                                    {Object.entries(patterns.patterns.byLocation)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([location, count]) => (
                                            <li key={location}>
                                                {location}: {count}회
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </details>
            )}
        </div>
    );
};

export default PatternInsights;
