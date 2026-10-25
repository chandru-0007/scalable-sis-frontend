import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sis_session_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem('sis_session_token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (res.status === 'SUCCESS' && (res.student || res.user)) {
            setUser(res.student || res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session check fallback:', err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  async function login(emailOrRoll, password) {
    setError(null);
    try {
      const payload = {
        email: emailOrRoll.trim(),
        password,
      };
      const res = await api.auth.login(payload);
      if (res.status === 'SUCCESS' && res.token) {
        localStorage.setItem('sis_session_token', res.token);
        setToken(res.token);
        const profile = res.student || res.user;
        setUser(profile);
        return profile;
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function register(formData) {
    setError(null);
    try {
      const res = await api.auth.register(formData);
      if (res.status === 'SUCCESS' && res.token) {
        localStorage.setItem('sis_session_token', res.token);
        setToken(res.token);
        const newUser = res.student || {
          studentId: res.student?.studentId,
          name: res.student?.name,
          email: res.student?.email,
          rollNumber: res.student?.rollNumber,
          department: res.student?.department,
          semester: res.student?.semester,
          role: res.student?.role || 'STUDENT',
          targetShard: res.student?.assignedShard,
        };
        setUser(newUser);
        return newUser;
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem('sis_session_token');
    setToken(null);
    setUser(null);
    try {
      api.auth.logout().catch(() => {});
    } catch (e) {}
  }

  // Quick switch for viva demonstration
  async function switchDemoRole(role) {
    try {
      if (role === 'STUDENT') {
        await login('chandru@college.edu', 'Chandru@123');
      } else if (role === 'FACULTY') {
        await login('ramanathan@college.edu', 'Faculty@123');
      } else if (role === 'ADMIN') {
        await login('admin@college.edu', 'Admin@123');
      } else if (role === 'PARENT') {
        try {
          await login('parent@college.edu', 'Parent@123');
        } catch (e) {
          localStorage.removeItem('sis_session_token');
          setToken(null);
          const parentUser = {
            studentId: 'PARENT_GUEST',
            name: 'Parent / Guardian',
            email: 'parent@college.edu',
            rollNumber: 'PAR001',
            role: 'PARENT',
            wardRollNumber: '22CS014',
            targetShard: 'sis_shard_1 (Ward)',
          };
          setUser(parentUser);
          return parentUser;
        }
      }
    } catch (err) {
      console.warn('Demo switch login notice:', err);
      // Direct offline fallback for immediate demo switch
      if (role === 'STUDENT') {
        setUser({
          studentId: '371292355980038144',
          name: 'Chandru S',
          email: 'chandru@college.edu',
          rollNumber: '22CS014',
          department: 'CSE',
          semester: 7,
          role: 'STUDENT',
          targetShard: 'sis_shard_1',
        });
      } else if (role === 'FACULTY') {
        setUser({
          studentId: '371292357410295808',
          name: 'Dr. A. Ramanathan',
          email: 'ramanathan@college.edu',
          rollNumber: 'FAC001',
          department: 'CSE',
          role: 'FACULTY',
          targetShard: 'sis_shard_1',
        });
      } else if (role === 'ADMIN') {
        setUser({
          studentId: '371292358236573696',
          name: 'Dr. K. Swaminathan (Registrar)',
          email: 'admin@college.edu',
          rollNumber: 'ADM001',
          department: 'ADMIN',
          role: 'ADMIN',
          targetShard: 'sis_shard_0',
        });
      } else if (role === 'PARENT') {
        localStorage.removeItem('sis_session_token');
        setToken(null);
        setUser({
          studentId: 'PARENT_GUEST',
          name: 'Parent / Guardian',
          email: 'parent@college.edu',
          rollNumber: 'PAR001',
          role: 'PARENT',
          wardRollNumber: '22CS014',
          targetShard: 'sis_shard_1 (Ward)',
        });
      }
    }
  }

  async function refreshProfile() {
    // If currently in Parent mode without a token, do not overwrite with an old session
    if (user?.role === 'PARENT' && !localStorage.getItem('sis_session_token')) {
      return;
    }
    const storedToken = localStorage.getItem('sis_session_token');
    if (storedToken) {
      try {
        const res = await api.auth.getMe();
        if (res.status === 'SUCCESS' && (res.student || res.user)) {
          const profile = res.student || res.user;
          setUser(profile);
          return profile;
        }
      } catch (err) {
        console.warn('Profile refresh fallback:', err);
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        switchDemoRole,
        refreshProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
