import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CostInputMethod, COGSItem } from '../../types';
import styles from './COGSBuilder.module.css';

export function COGSBuilder() {
    const { activeScenario, updateActiveScenario, results } = useScenario();
    const { cogs, product } = activeScenario;

    const setInputMethod = (method: CostInputMethod) => {
        updateActiveScenario(prev => ({
            ...prev,
            cogs: { ...prev.cogs, inputMethod: method }
        }));
    };

    const setTotalCost = (val: number) => {
        updateActiveScenario(prev => ({
            ...prev,
            cogs: { ...prev.cogs, totalCaseCost: val }
        }));
    };

    const updateLineItem = (id: string, field: keyof COGSItem, val: string | number) => {
        updateActiveScenario(prev => ({
            ...prev,
            cogs: {
                ...prev.cogs,
                lineItems: prev.cogs.lineItems.map(item =>
                    item.id === id ? { ...item, [field]: val } : item
                )
            }
        }));
    };

    const addLineItem = () => {
        updateActiveScenario(prev => ({
            ...prev,
            cogs: {
                ...prev.cogs,
                lineItems: [...prev.cogs.lineItems, { id: uuidv4(), name: 'New Cost Item', cost: 0 }]
            }
        }));
    };

    const loadStandardCategories = () => {
        updateActiveScenario(prev => ({
            ...prev,
            cogs: {
                ...prev.cogs,
                lineItems: [
                    { id: uuidv4(), name: 'Ingredients', cost: 0 },
                    { id: uuidv4(), name: 'Raw Materials', cost: 0 },
                    { id: uuidv4(), name: 'Primary: Cans', cost: 0 },
                    { id: uuidv4(), name: 'Primary: Bottles', cost: 0 },
                    { id: uuidv4(), name: 'Primary: Pouches', cost: 0 },
                    { id: uuidv4(), name: 'Primary: Film', cost: 0 },
                    { id: uuidv4(), name: 'Secondary: Caps', cost: 0 },
                    { id: uuidv4(), name: 'Secondary: Lids', cost: 0 },
                    { id: uuidv4(), name: 'Secondary: Labels', cost: 0 },
                    { id: uuidv4(), name: 'Secondary: Sleeves', cost: 0 },
                    { id: uuidv4(), name: 'Tertiary: Master Cases', cost: 0 },
                    { id: uuidv4(), name: 'Tertiary: Corrugated Trays', cost: 0 },
                    { id: uuidv4(), name: 'Tertiary: Glue', cost: 0 },
                    { id: uuidv4(), name: 'Palletization: Pallets', cost: 0 },
                    { id: uuidv4(), name: 'Palletization: Stretch Wrap', cost: 0 },
                    { id: uuidv4(), name: 'Palletization: Slip Sheets', cost: 0 },
                    { id: uuidv4(), name: 'Labor Fee', cost: 0 },
                    { id: uuidv4(), name: 'Co-Packer Fill Fee', cost: 0 },
                    { id: uuidv4(), name: 'Inbound Freight', cost: 0 },
                    { id: uuidv4(), name: 'Outbound Freight', cost: 0 },
                    { id: uuidv4(), name: 'Warehousing', cost: 0 },
                    { id: uuidv4(), name: '3PL Handling', cost: 0 },
                    { id: uuidv4(), name: 'Spoilage / Shrinkage', cost: 0 }
                ]
            }
        }));
    };

    const removeLineItem = (id: string) => {
        updateActiveScenario(prev => ({
            ...prev,
            cogs: {
                ...prev.cogs,
                lineItems: prev.cogs.lineItems.filter(item => item.id !== id)
            }
        }));
    };

    return (
        <div className={styles.container}>
            <div className={styles.summaryRow}>
                <StatCard
                    title="Total Avg COGS / Case"
                    value={`$${results.base.cogsPerCase.toFixed(2)}`}
                    highlight
                />
                <StatCard
                    title="Avg COGS / Unit"
                    value={`$${results.base.cogsPerUnit.toFixed(2)}`}
                    subtitle={`Based on ${activeScenario.product.casePack} units/case`}
                />
            </div>

            <Card className={styles.builderCard}>
                <CardHeader
                    title="Average Cost of Goods Sold"
                    subtitle="How would you like to input your costs?"
                />

                <div className={styles.methodToggle}>
                    <button
                        className={cogs.inputMethod === 'supplier' ? styles.activeToggle : styles.toggleBtn}
                        onClick={() => setInputMethod('supplier')}
                    >
                        Supplier / Co-Packer Margin
                    </button>
                    <button
                        className={cogs.inputMethod === 'itemized' ? styles.activeToggle : styles.toggleBtn}
                        onClick={() => setInputMethod('itemized')}
                    >
                        Itemized Lines (Detailed)
                    </button>
                    <button
                        className={cogs.inputMethod === 'total' ? styles.activeToggle : styles.toggleBtn}
                        onClick={() => setInputMethod('total')}
                    >
                        Total Case Cost (Simple)
                    </button>
                </div>

                {cogs.inputMethod === 'supplier' ? (
                    <div className={styles.totalEntry}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                            <Input
                                label="Supplier Cost to Produce (per case)"
                                type="number"
                                min={0}
                                step="0.01"
                                prefix="$"
                                value={product.supplierBaseCost === undefined ? '' : product.supplierBaseCost}
                                onChange={(e) => updateActiveScenario(prev => ({ ...prev, product: { ...prev.product, supplierBaseCost: parseFloat(e.target.value) || 0 } }))}
                                helperText="Cost strictly to manufacture"
                            />
                            <Input
                                label="Supplier Gross Margin (%)"
                                type="number"
                                min={0}
                                max={100}
                                step="1"
                                suffix="%"
                                value={product.supplierGrossMargin === undefined ? '' : product.supplierGrossMargin}
                                onChange={(e) => updateActiveScenario(prev => ({ ...prev, product: { ...prev.product, supplierGrossMargin: parseFloat(e.target.value) || 0 } }))}
                                helperText="Margin supplier takes on top"
                            />
                        </div>

                        {results.base.baseCogsPerCase > 0 && (
                            <div style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                                <div style={{ fontSize: '1.1rem', color: 'var(--color-text)' }}>
                                    Supplier Base Cost Output: <strong>${results.base.baseCogsPerCase.toFixed(2)}</strong>
                                </div>
                                {results.base.activeFreightCostPerCase > 0 && (
                                    <div style={{ fontSize: '0.95rem', color: 'var(--color-emerald)', marginTop: '8px' }}>
                                        + ${results.base.activeFreightCostPerCase.toFixed(2)} Active Freight Quote
                                    </div>
                                )}
                                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                    Total Landed COGS: ${results.base.cogsPerCase.toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>
                ) : cogs.inputMethod === 'total' ? (
                    <div className={styles.totalEntry}>
                        <Input
                            label="Total Avg Case Cost ($)"
                            type="number"
                            min={0}
                            step="0.01"
                            prefix="$"
                            value={cogs.totalCaseCost || 0}
                            onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)}
                            helperText="Enter the fully loaded base cost to produce one case."
                        />
                        {results.base.activeFreightCostPerCase > 0 && (
                            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--color-emerald)' }}>
                                <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>+ ${results.base.activeFreightCostPerCase.toFixed(2)} Active Freight</span> from Freight Quotes will be actively added to your COGS.<br/>
                                <strong style={{ display: 'block', marginTop: '4px' }}>Total Landed COGS: ${results.base.cogsPerCase.toFixed(2)}</strong>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.itemizedEntry}>
                        <div className={styles.tableHeader}>
                            <div className={styles.colName}>Cost Category / Description</div>
                            <div className={styles.colCost}>Cost per Case ($)</div>
                            <div className={styles.colAction}></div>
                        </div>

                        <div className={styles.lineItems}>
                            {cogs.lineItems.map(item => (
                                <div key={item.id} className={styles.lineItemRow}>
                                    <div className={styles.colName}>
                                        <Input
                                            value={item.name}
                                            onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                                            placeholder="e.g. Packaging, Ingredients"
                                        />
                                    </div>
                                    <div className={styles.colCost}>
                                        <Input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            prefix="$"
                                            value={item.cost === 0 ? '' : item.cost}
                                            onChange={(e) => updateLineItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className={styles.colAction}>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => removeLineItem(item.id)}
                                            title="Remove Row"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button className={styles.addBtn} onClick={addLineItem}>
                                <Plus size={16} />
                                Add Cost Line
                            </button>
                            {cogs.lineItems.length <= 1 && cogs.lineItems.every(i => i.cost === 0) && (
                                <button
                                    className={styles.addBtn}
                                    style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                                    onClick={loadStandardCategories}
                                >
                                    Load Standard CPG Layout
                                </button>
                            )}
                        </div>

                        {results.base.activeFreightCostPerCase > 0 && (
                            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-emerald)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>+ Active Freight Quote applied:</span>
                                    <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>${results.base.activeFreightCostPerCase.toFixed(2)} / case</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', fontSize: '1.1rem' }}>
                                    <strong>Total Landed COGS:</strong>
                                    <strong>${results.base.cogsPerCase.toFixed(2)}</strong>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
}
