import React from 'react';
import { ArrowRight, BarChart3, Calculator, ShieldCheck } from 'lucide-react';
import styles from './LandingPage.module.css';

interface Props {
    onLoginClick: () => void;
    onSignUpClick?: () => void;
}

export function LandingPage({ onLoginClick, onSignUpClick }: Props) {
    return (
        <div className={styles.container}>
            {/* Header / Navbar */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.logo}>
                        <img src="/logo.png" alt="CPG Margin Minder Logo" className={styles.logoImage} />
                    </div>

                    <nav className={styles.nav}>
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How It Works</a>
                        <button className={styles.loginBtn} onClick={onLoginClick}>
                            Sign In
                        </button>
                        <button className={styles.loginBtn} style={{ background: 'var(--color-primary)', color: 'white', border: 'none' }} onClick={onSignUpClick}>
                            Sign Up
                        </button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Master Your CPG Product Economics
                    </h1>
                    <p className={styles.heroSubtitle}>
                        The ultimate profit modeling engine for food and beverage brands. Calculate COGS, model trade spend, and predict true contribution margins across the entire retail supply chain.
                    </p>
                    <div className={styles.heroActions}>
                        <button className={styles.primaryActionBtn} onClick={onSignUpClick}>
                            Start for Free <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Decorative Hero Graphic */}
                <div className={styles.heroGraphic}>
                    <div className={styles.mockupWindow}>
                        <div className={styles.mockupHeader}>
                            <span className={styles.dot} style={{ background: '#ff5f56' }} />
                            <span className={styles.dot} style={{ background: '#ffbd2e' }} />
                            <span className={styles.dot} style={{ background: '#27c93f' }} />
                        </div>
                        <div className={styles.mockupBody}>
                            <div className={styles.mockupRow}>
                                <div className={styles.mockupBlock} style={{ width: '40%' }} />
                                <div className={styles.mockupBlock} style={{ width: '20%' }} />
                                <div className={styles.mockupBlock} style={{ width: '15%' }} />
                            </div>
                            <div className={styles.mockupRow}>
                                <div className={styles.mockupBlock} style={{ width: '60%' }} />
                                <div className={styles.mockupBlock} style={{ width: '15%' }} />
                                <div className={styles.mockupBlock} style={{ width: '10%' }} />
                            </div>
                            <div className={styles.mockupChart}>
                                <div className={styles.barLine} style={{ height: '40%' }} />
                                <div className={styles.barLine} style={{ height: '70%', background: 'var(--color-primary)' }} />
                                <div className={styles.barLine} style={{ height: '50%' }} />
                                <div className={styles.barLine} style={{ height: '90%', background: 'var(--color-emerald)' }} />
                                <div className={styles.barLine} style={{ height: '60%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className={styles.features}>
                <div className={styles.sectionHeader}>
                    <h2>Why Top Brands Choose Us</h2>
                    <p>Designed specifically to map the nuances of the Consumer Packaged Goods industry.</p>
                </div>

                <div className={styles.featureGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIconBox}>
                            <Calculator size={24} />
                        </div>
                        <h3>Deep COGS Building</h3>
                        <p>Line-item your raw materials, packaging, and labor to instantly calculate blended average costs per pallet, case, and unit.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIconBox}>
                            <BarChart3 size={24} />
                        </div>
                        <h3>3-Tier Waterfall Pricing</h3>
                        <p>Dynamically build out target margins for Manufacturers, Distributors, and Retailers all on a single unified canvas.</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIconBox}>
                            <ShieldCheck size={24} />
                        </div>
                        <h3>Live Trade Spend ROI</h3>
                        <p>Map scan allowances, TPRs, and Slotting Fees. Auto-calculate Break-Even velocity and absolute Net Contribution dollars.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerBrand}>
                        <div className={styles.logoIconSmall}>
                            <BarChart3 size={16} color="white" />
                        </div>
                        <span>CPG Margin Minder</span>
                    </div>
                    <div className={styles.footerLinks}>
                        <span>&copy; 2026 CPG Field Solutions. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
