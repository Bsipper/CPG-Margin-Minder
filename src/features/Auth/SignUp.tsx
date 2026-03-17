import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './SignUp.module.css';

interface Props {
    onBack?: () => void;
    onLoginClick: () => void;
}

export function SignUp({ onBack, onLoginClick }: Props) {
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { signup } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        signup(email, password, companyName);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {onBack && (
                    <button className={styles.backBtn} onClick={onBack}>
                        <ArrowLeft size={16} /> Back to Home
                    </button>
                )}
                <div className={styles.header}>
                    <img src="/logo.png" alt="CPG Margin Minder Logo" className={styles.logoImage} />
                    <p>Create an account to track your company scenarios.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Company Name</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={e => setCompanyName(e.target.value)}
                            placeholder="Your Company Inc."
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@yourcompany.com"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div style={{ color: '#ef4444', fontSize: 'var(--font-size-sm)' }}>{error}</div>}

                    <button type="submit" className={styles.signupBtn}>Sign Up</button>
                </form>

                <div className={styles.loginLink}>
                    Already have an account? <a onClick={onLoginClick}>Sign In</a>
                </div>
            </div>
        </div>
    );
}
