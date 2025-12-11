import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const savedTeacher = localStorage.getItem('teacher');

        if (token && savedTeacher) {
            setTeacher(JSON.parse(savedTeacher));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        console.log('🔐 Frontend: Login attempt', { email });
        try {
            const response = await authAPI.login({ email, password });
            console.log('✅ Frontend: Login response received', response.data);
            const { token, teacher } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('teacher', JSON.stringify(teacher));
            setTeacher(teacher);

            return response.data;
        } catch (error) {
            console.error('❌ Frontend: Login error', error);
            throw error;
        }
    };

    const register = async (email, password, name) => {
        const response = await authAPI.register({ email, password, name });
        const { token, teacher } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('teacher', JSON.stringify(teacher));
        setTeacher(teacher);

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('teacher');
        setTeacher(null);
    };

    return (
        <AuthContext.Provider value={{ teacher, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
