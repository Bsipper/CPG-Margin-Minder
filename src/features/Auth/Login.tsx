import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

interface Props {
    onBack?: () => void;
}

export function Login({ onBack }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email, password);
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
                    <p>Please sign in to access your company scenarios.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@sipper.com"
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
                        />
                        <span className={styles.helperText}>Required for Super Admin, optional for demo accounts.</span>
                    </div>

                    <button type="submit" className={styles.loginBtn}>Sign In</button>
                </form>

                <div className={styles.demoAccounts}>
                    <p><strong>Demo Accounts:</strong></p>
                    <ul>
                        <li onClick={() => setEmail('Bill@cascadiafoodbev.com')}>Super Admin: <code>Bill@cascadiafoodbev.com</code></li>
                        <li onClick={() => setEmail('admin@sipper.com')}>Admin: <code>admin@sipper.com</code></li>
                        <li onClick={() => setEmail('distributor@demo.com')}>Distributor: <code>distributor@demo.com</code></li>
                        <li onClick={() => setEmail('buyer@retailer.com')}>Retailer: <code>buyer@retailer.com</code></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
