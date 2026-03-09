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
    const { cogs } = activeScenario;

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

                {cogs.inputMethod === 'total' ? (
                    <div className={styles.totalEntry}>
                        <Input
                            label="Total Avg Case Cost ($)"
                            type="number"
                            min={0}
                            step="0.01"
                            prefix="$"
                            value={cogs.totalCaseCost || 0}
                            onChange={(e) => setTotalCost(parseFloat(e.target.value) || 0)}
                            helperText="Enter the fully loaded cost to produce one case."
                        />
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

                        <button className={styles.addBtn} onClick={addLineItem}>
                            <Plus size={16} />
                            Add Cost Line
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
}
