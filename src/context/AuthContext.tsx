import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MockDB } from '../api/mockDb';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password?: string) => void;
    signup: (email: string, password?: string, companyName?: string) => void;
    logout: () => void;
    acceptTerms: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: () => { },
    signup: () => { },
    logout: () => { },
    acceptTerms: () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initSession = async () => {
            const storedUserId = localStorage.getItem('session_user_id');
            if (storedUserId) {
                const users = await MockDB.getUsers();
                const u = users.find(u => u.id === storedUserId);
                if (u) setUser(u);
            }
            setIsLoading(false);
        };
        initSession();
    }, []);

    const login = async (email: string, password?: string) => {
        setIsLoading(true);
        // Hardcoded explicit bypass for Super Admin so we don't rely on the user's browser cache being clear
        if (email.toLowerCase() === 'bill@cascadiafoodbev.com') {
            if (password !== 'Cascadia$22&88#') {
                alert('Invalid password for Super Admin account.');
                setIsLoading(false);
                return;
            }
            const saUser: User = { id: 'usr_sa1', email: 'Bill@cascadiafoodbev.com', role: 'super_admin', companyId: 'comp_sys', hasAcceptedTerms: true };
            setUser(saUser);
            localStorage.setItem('session_user_id', saUser.id);
            // Ensure this user exists in the local MockDB cache for future lookups
            const users = await MockDB.getUsers();
            if (!users.find(u => u.email.toLowerCase() === 'bill@cascadiafoodbev.com')) {
                await MockDB.saveUser(saUser);
            }
            setIsLoading(false);
            return;
        }

        // Mock authentication - just find a user by email
        const users = await MockDB.getUsers();
        const u = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (u) {
            setUser(u);
            localStorage.setItem('session_user_id', u.id);
        } else {
            alert("User not found. Try 'Bill@cascadiafoodbev.com', 'admin@sipper.com', 'distributor@demo.com', or 'buyer@retailer.com'");
        }
        setIsLoading(false);
    };

    const signup = async (email: string, _password?: string, companyName?: string) => {
        setIsLoading(true);
        const users = await MockDB.getUsers();
        const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existingUser) {
            alert('A user with this email already exists.');
            setIsLoading(false);
            return;
        }

        const newCompanyId = `comp_${uuidv4()}`;
        const newCompany = {
            id: newCompanyId,
            name: companyName || 'New Company'
        };
        await MockDB.saveCompany(newCompany);

        const newUser: User = {
            id: `usr_${uuidv4()}`,
            email: email,
            role: 'admin',
            companyId: newCompanyId,
            hasAcceptedTerms: false
        };
        await MockDB.saveUser(newUser);

        setUser(newUser);
        localStorage.setItem('session_user_id', newUser.id);
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('session_user_id');
    };

    const acceptTerms = async () => {
        if (!user) return;
        const updatedUser = { ...user, hasAcceptedTerms: true };
        setUser(updatedUser);
        await MockDB.saveUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, acceptTerms }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
