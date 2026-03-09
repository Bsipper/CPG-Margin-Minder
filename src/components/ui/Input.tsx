import React, { InputHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
    label?: string;
    error?: string;
    helperText?: string;
    prefix?: ReactNode;
    suffix?: ReactNode;
    fullWidth?: boolean;
}

export function Input({
    label,
    error,
    helperText,
    prefix,
    suffix,
    className,
    fullWidth = true,
    id,
    ...props
}: InputProps) {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
        <div className={clsx(styles.wrapper, { [styles.fullWidth]: fullWidth }, className)}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
            )}
            <div className={clsx(styles.inputContainer, { [styles.hasError]: !!error })}>
                {prefix && <div className={styles.prefix}>{prefix}</div>}
                <input
                    id={inputId}
                    className={clsx(styles.input, {
                        [styles.withPrefix]: !!prefix,
                        [styles.withSuffix]: !!suffix
                    })}
                    {...props}
                />
                {suffix && <div className={styles.suffix}>{suffix}</div>}
            </div>
            {(error || helperText) && (
                <p className={clsx(styles.helperText, { [styles.errorText]: !!error })}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}
