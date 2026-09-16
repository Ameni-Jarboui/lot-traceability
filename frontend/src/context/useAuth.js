import { useContext } from 'react';
import { AuthContext } from './authContextObject';

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth doit etre utilise dans un AuthProvider');
    return ctx;
}