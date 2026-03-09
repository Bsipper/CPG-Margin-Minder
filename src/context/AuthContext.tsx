import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MockDB } from '../api/mockDb';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password?: string) => void;
    logout: () => void;
    acceptTerms: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: () => { },
    logout: () => { },
    acceptTerms: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check local storage for session
        const storedUserId = localStorage.getItem('session_user_id');
        if (storedUserId) {
            const u = MockDB.getUsers().find(u => u.id === storedUserId);
            if (u) setUser(u);
        }
        setIsLoading(false);
    }, []);

    const login = (email: string, password?: string) => {
        // Hardcoded explicit bypass for Super Admin so we don't rely on the user's browser cache being clear
        if (email.toLowerCase() === 'bill@cascadiafoodbev.com') {
            if (password !== 'Cascadia$22&88#') {
                alert('Invalid password for Super Admin account.');
                return;
            }
            const saUser: User = { id: 'usr_sa1', email: 'Bill@cascadiafoodbev.com', role: 'super_admin', companyId: 'comp_sys', hasAcceptedTerms: true };
            setUser(saUser);
            localStorage.setItem('session_user_id', saUser.id);
            // Ensure this user exists in the local MockDB cache for future lookups
            const users = MockDB.getUsers();
            if (!users.find(u => u.email.toLowerCase() === 'bill@cascadiafoodbev.com')) {
                MockDB.saveUser(saUser);
            }
            return;
        }

        // Mock authentication - just find a user by email
        const u = MockDB.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());

        if (u) {
            setUser(u);
            localStorage.setItem('session_user_id', u.id);
        } else {
            alert("User not found. Try 'Bill@cascadiafoodbev.com', 'admin@sipper.com', 'distributor@demo.com', or 'buyer@retailer.com'");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('session_user_id');
    };

    const acceptTerms = () => {
        if (!user) return;
        const updatedUser = { ...user, hasAcceptedTerms: true };
        setUser(updatedUser);
        MockDB.saveUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, acceptTerms }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
