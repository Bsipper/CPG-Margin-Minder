import React, { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Slider.module.css';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    value: number;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    helperText?: string;
    warningText?: string;
}

export function Slider({
    label,
    value,
    min = 0,
    max = 100,
    step = 1,
    suffix = '%',
    helperText,
    warningText,
    className,
    ...props
}: SliderProps) {
    // Calculate percentage for styling the track fill
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={clsx(styles.wrapper, className)}>
            <div className={styles.header}>
                <label className={styles.label}>{label}</label>
                <div className={styles.valueDisplay}>
                    <input
                        type="number"
                        value={value}
                        min={min}
                        max={max}
                        step={step}
                        onChange={props.onChange}
                        className={styles.numberInput}
                    />
                    <span className={styles.suffix}>{suffix}</span>
                </div>
            </div>

            <div className={styles.sliderContainer}>
                <input
                    type="range"
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    className={styles.range}
                    style={{ '--progress': `${percentage}%` } as React.CSSProperties}
                    {...props}
                />
            </div>

            {warningText && <p className={styles.warningText}>⚠️ {warningText}</p>}
            {helperText && !warningText && <p className={styles.helperText}>{helperText}</p>}
        </div>
    );
}
