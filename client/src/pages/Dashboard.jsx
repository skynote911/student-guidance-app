import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analysisAPI } from '../services/api';
import InputArea from '../components/InputArea';
import ResultCard from '../components/ResultCard';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { teacher, logout } = useAuth();
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async (inputData) => {
        setLoading(true);

        try {
            const response = await analysisAPI.analyze({
                text: inputData.text,
                studentId: inputData.studentId,
                involvedStudents: inputData.involvedStudents, // Pass involved students
                saveToDb: true,
                audioPath: inputData.audioPath,
                attachedFiles: inputData.attachedFiles // Pass attached files
            });

            if (response.data.success) {
                const newResult = {
                    ...response.data.analysis,
                    incidentId: response.data.incidentId,
                    studentId: inputData.studentId, // Main student
                    involvedStudents: inputData.involvedStudents || [], // Available for UI
                    timestamp: new Date()
                };

                // If student ID provided, analyze patterns
                if (inputData.studentId && inputData.studentId !== 'unknown') {
                    try {
                        const patternResponse = await analysisAPI.analyzePattern({
                            studentId: inputData.studentId
                        });

                        if (patternResponse.data.success && patternResponse.data.patterns) {
                            newResult.patterns = patternResponse.data;
                        }
                    } catch (patternError) {
                        console.error('Pattern analysis error:', patternError);
                        // Continue without patterns if analysis fails
                    }
                }

                // Add new result to the top
                setResults([newResult, ...results]);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            const errorMsg = error.response?.data?.message || error.message || '분석 중 원인 모를 오류가 발생했습니다.';
            alert(`분석 실패: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            <Navbar />

            <main className="dashboard-main">
                <InputArea onAnalyze={handleAnalyze} loading={loading} />

                <div className="results-section">
                    {results.length > 0 && (
                        <div className="results-header">
                            <h2>분석 결과</h2>
                            <span className="results-count">{results.length}건</span>
                        </div>
                    )}

                    <div className="results-container">
                        {results.map((result, index) => (
                            <ResultCard key={index} analysis={result} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
