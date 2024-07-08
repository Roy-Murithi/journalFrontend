import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

interface AuthProps {
    authState?: { accessToken: string | null; refreshToken: string | null; authenticated: boolean | null };
    onRegister?: (email: string, first_name: string, last_name: string, password: string) => Promise<any>;
    onLogin?: (email: string, password: string) => Promise<any>;
    onLogout?: () => Promise<any>;
    onResetPassword?: (email: string, password: string) => Promise<any>;
    loadUser: () => Promise<any>
}

const ACCESS_TOKEN_KEY = 'access';
const REFRESH_TOKEN_KEY = 'refresh';
export const API_URL = 'http://localhost:8000';
const AuthContext = createContext<AuthProps>({
    loadUser: function (): Promise<any> {
        throw new Error('Function not implemented.');
    }
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
    const [authState, setAuthState] = useState<{
        accessToken: string | null;
        refreshToken: string | null;
        authenticated: boolean | null;
    }>({
        accessToken: null,
        refreshToken: null,
        authenticated: null,
    });

    useEffect(() => {
        loadTokens();
        setupAxiosInterceptors();
    }, []);

    const loadTokens = async () => {
        const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (accessToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            setAuthState({
                accessToken: accessToken,
                refreshToken: refreshToken,
                authenticated: true,
            });
        }
    };

    const setupAxiosInterceptors = () => {
        axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response.status === 401) {
                    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
                    if (refreshToken) {
                        try {
                            const response = await axios.post(`${API_URL}/users/api/token/refresh/`, { refresh: refreshToken });
                            const { access } = response.data;
                            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
                            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                            setAuthState(prev => ({ ...prev, accessToken: access }));
                            error.config.headers['Authorization'] = `Bearer ${access}`;
                            return axios(error.config);
                        } catch (refreshError) {
                            console.error('Error refreshing token:', refreshError);
                            await logout();
                        }
                    } else {
                        await logout();
                    }
                }
                return Promise.reject(error);
            }
        );
    };

    const register = async (email: string, first_name: string, last_name: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/users/signup/`, { email, first_name, last_name, password });
            return response.data;
        } catch (e) {
            return { error: true, msg: (e as any).response.data };
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/users/api/token/`, { email, password });
            const { access, refresh } = response.data;

            setAuthState({
                accessToken: access,
                refreshToken: refresh,
                authenticated: true,
            });

            axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);

            return response.data;
        } catch (e) {
            return { error: true, msg: (e as any).response.data };
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

        axios.defaults.headers.common['Authorization'] = '';

        setAuthState({
            accessToken: null,
            refreshToken: null,
            authenticated: false,
        });
    };

    const resetPassword = async (email: string, new_password: string) => {
        try {
            const response = await axios.post(`${API_URL}/users/reset-password/`, { email, new_password });
            return response.data;
        } catch (e) {
            return { error: true, msg: (e as any).response.data };
        }
    };

    const loadUser = async () => {
        try {
            const response = await axios.get(`${API_URL}/users/profile/me`);
            return response.data;
        } catch (error) {
            console.error('Error loading user:', error);
            return null;
        }
    };

    const value = {
        onRegister: register,
        onLogin: login,
        onLogout: logout,
        onResetPassword: resetPassword,
        loadUser: loadUser,
        authState,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};