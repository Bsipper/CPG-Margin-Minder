import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import styles from './FreightEngine.module.css';
import { v4 as uuidv4 } from 'uuid';
import { FreightQuote } from '../../types';

export function FreightEngine() {
    const { activeScenario, updateActiveScenario } = useScenario();
    const { freightQuotes = [], product } = activeScenario;

    const addQuote = () => {
        updateActiveScenario(prev => ({
            ...prev,
            freightQuotes: [...(prev.freightQuotes || []), {
                id: uuidv4(),
                origin: '',
                destination: '',
                shipmentType: '1 Pallet',
                pallets: 1,
                quoteTotal: 0
            }]
        }));
    };

    const updateQuote = (id: string, field: keyof FreightQuote, value: string | number) => {
        updateActiveScenario(prev => {
            const currentQuotes = prev.freightQuotes || [];
            const newQuotes = currentQuotes.map(q => {
                if (q.id === id) {
                    const updated = { ...q, [field]: value };
                    
                    if (field === 'shipmentType') {
                        if (value === '1 Pallet') updated.pallets = 1;
                        if (value === '5 Pallets') updated.pallets = 5;
                        if (value === '10 Pallets') updated.pallets = 10;
                        if (value === 'Full Truckload') updated.pallets = product.palletsPerTruckload || 26;
                    }

                    return updated;
                }
                return q;
            });
            return { ...prev, freightQuotes: newQuotes };
        });
    };

    const deleteQuote = (id: string) => {
        updateActiveScenario(prev => ({
            ...prev,
            freightQuotes: (prev.freightQuotes || []).filter(q => q.id !== id),
            activeFreightQuoteId: prev.activeFreightQuoteId === id ? undefined : prev.activeFreightQuoteId
        }));
    };

    const toggleActiveQuote = (id: string) => {
        updateActiveScenario(prev => ({
            ...prev,
            activeFreightQuoteId: prev.activeFreightQuoteId === id ? undefined : id
        }));
    };

    const fmtCurrency = (val: number) => `$${val.toFixed(2)}`;

    const casesPerPallet = product.casesPerPallet || 1;
    const weightPerCase = product.weightPerCase || 0;

    return (
        <div className={styles.container}>
            <Card>
                <CardHeader
                    title="Freight Quotes Calculator"
                    subtitle="Calculate cost per pallet and unit cost across various routes based on your Product Setup specifications."
                />

                <div className={styles.quotesList}>
                    {freightQuotes.length === 0 ? (
                        <p className={styles.emptyText}>No freight quotes added yet.</p>
                    ) : (
                        freightQuotes.map(quote => {
                            const pallets = quote.pallets || 1;
                            const cases = pallets * casesPerPallet;
                            const weight = cases * weightPerCase;
                            
                            const costPerPallet = pallets > 0 ? quote.quoteTotal / pallets : 0;
                            const costPerCase = cases > 0 ? quote.quoteTotal / cases : 0;
                            const costPerLb = weight > 0 ? quote.quoteTotal / weight : 0;

                            const isActive = quote.id === activeScenario.activeFreightQuoteId;

                            return (
                                <div key={quote.id} className={styles.quoteCard} style={isActive ? { border: '2px solid var(--color-emerald)' } : {}}>
                                    <div className={styles.quoteHeader}>
                                        <div className={styles.inputGroupTop}>
                                            <Input
                                                label="Origin"
                                                value={quote.origin}
                                                onChange={e => updateQuote(quote.id, 'origin', e.target.value)}
                                                placeholder="e.g. Des Moines, IA"
                                            />
                                            <Input
                                                label="Destination"
                                                value={quote.destination}
                                                onChange={e => updateQuote(quote.id, 'destination', e.target.value)}
                                                placeholder="e.g. Salt Lake City, UT"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button 
                                                onClick={() => toggleActiveQuote(quote.id)}
                                                style={{
                                                    padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px',
                                                    borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.875rem',
                                                    cursor: 'pointer', transition: 'all 0.2s',
                                                    ...(isActive 
                                                        ? { background: 'var(--color-emerald)', color: 'white', border: '1px solid var(--color-emerald)' }
                                                        : { background: 'var(--color-primary)', color: 'white', border: '1px solid var(--color-primary)' }
                                                    )
                                                }}
                                            >
                                                <CheckCircle2 size={16} />
                                                {isActive ? 'Active Quote' : 'Select'}
                                            </button>
                                            <button className={styles.deleteBtn} onClick={() => deleteQuote(quote.id)} title="Remove Quote">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.quoteDetails}>
                                        <div className={styles.quoteDetailsCol}>
                                            <Input
                                                label="Shipment Type"
                                                value={quote.shipmentType}
                                                onChange={e => updateQuote(quote.id, 'shipmentType', e.target.value)}
                                                placeholder="e.g. 5 Pallets"
                                            />
                                        </div>
                                        <div className={styles.quoteDetailsCol}>
                                            <Input
                                                label="# of Pallets"
                                                type="number"
                                                min={0.1}
                                                step="0.1"
                                                value={quote.pallets || ''}
                                                onChange={e => updateQuote(quote.id, 'pallets', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className={styles.quoteDetailsCol}>
                                            <Input
                                                label="Quote Total ($)"
                                                type="number"
                                                min={0}
                                                step="1"
                                                prefix="$"
                                                value={quote.quoteTotal || ''}
                                                onChange={e => updateQuote(quote.id, 'quoteTotal', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className={styles.quoteDetailsCol}>
                                            <Input
                                                label="Carrier / Notes"
                                                value={quote.carrier || ''}
                                                onChange={e => updateQuote(quote.id, 'carrier', e.target.value)}
                                                placeholder="Carrier Name or specific terms"
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.quoteResults}>
                                        <div className={styles.resultMetric}>
                                            <span className={styles.metricLabel}>Total Cases</span>
                                            <span className={styles.metricValue}>{Math.round(cases).toLocaleString()}</span>
                                        </div>
                                        <div className={styles.resultMetric}>
                                            <span className={styles.metricLabel}>Total Weight (lbs)</span>
                                            <span className={styles.metricValue}>{weight > 0 ? weight.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '--'}</span>
                                        </div>
                                        <div className={styles.resultMetric}>
                                            <span className={styles.metricLabel}>Cost / Lb</span>
                                            <span className={styles.metricValue}>{costPerLb > 0 ? fmtCurrency(costPerLb) : '--'}</span>
                                        </div>
                                        <div className={styles.resultMetric}>
                                            <span className={styles.metricLabel}>Cost / Pallet</span>
                                            <span className={styles.metricValue}>{costPerPallet > 0 ? fmtCurrency(costPerPallet) : '--'}</span>
                                        </div>
                                        <div className={styles.resultMetric}>
                                            <span className={styles.metricLabel}>Cost / Case</span>
                                            <span className={styles.metricValue} style={{ color: 'var(--color-emerald)' }}>{costPerCase > 0 ? fmtCurrency(costPerCase) : '--'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className={styles.actions}>
                    <button className={styles.addBtn} onClick={addQuote}>
                        <Plus size={16} /> Add Freight Quote
                    </button>
                </div>
            </Card>
        </div>
    );
}
