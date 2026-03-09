import React, { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

interface CardProps {
    children: ReactNode;
    className?: string;
    noPadding?: boolean;
}

export function Card({ children, className, noPadding = false }: CardProps) {
    return (
        <div className={clsx(styles.card, className, { [styles.noPadding]: noPadding })}>
            {children}
        </div>
    );
}

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
    return (
        <div className={styles.header}>
            <div>
                <h3 className={styles.title}>{title}</h3>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    highlight?: boolean;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

export function StatCard({ title, value, subtitle, highlight, trend, trendValue }: StatCardProps) {
    return (
        <Card className={clsx(styles.statCard, { [styles.highlight]: highlight })}>
            <p className={styles.statTitle}>{title}</p>
            <p className={styles.statValue}>{value}</p>

            {(subtitle || trendValue) && (
                <div className={styles.statFooter}>
                    {trendValue && (
                        <span className={clsx(styles.trend, styles[`trend_${trend}`])}>
                            {trend === 'up' && '↑'}
                            {trend === 'down' && '↓'}
                            {trendValue}
                        </span>
                    )}
                    {subtitle && <span className={styles.statSubtitle}>{subtitle}</span>}
                </div>
            )}
        </Card>
    );
}
