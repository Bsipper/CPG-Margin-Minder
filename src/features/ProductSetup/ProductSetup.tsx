import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Check } from 'lucide-react';
import styles from './ProductSetup.module.css';

export function ProductSetup() {
    const { activeScenario, updateActiveScenario } = useScenario();
    const { product } = activeScenario;
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 2000);
    };

    const handleChange = (field: keyof typeof product, value: string | number) => {
        updateActiveScenario(prev => ({
            ...prev,
            name: field === 'name' ? String(value) : prev.name, // optionally sync scenario name with product name
            product: {
                ...prev.product,
                [field]: value
            }
        }));
    };

    return (
        <div className={styles.container}>
            <Card className={styles.setupCard}>
                <CardHeader
                    title="Product Definition"
                    subtitle="Set the basic details of the formulation and packaging."
                />

                <div className={styles.formGrid}>
                    <Input
                        label="Product Name *"
                        value={product.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g. Sparkling Matcha Energy"
                        className={styles.fullRow}
                    />

                    <Input
                        label="SKU ID"
                        value={product.sku}
                        onChange={(e) => handleChange('sku', e.target.value)}
                        placeholder="e.g. SME-12"
                    />

                    <Input
                        label="Units Per Case *"
                        type="number"
                        min={1}
                        value={product.casePack}
                        onChange={(e) => handleChange('casePack', parseInt(e.target.value) || 12)}
                        helperText="Economics are calculated on a per-case basis, then divided by this number for unit costs."
                    />

                    <Input
                        label="Size / Ounces (Optional)"
                        value={product.sizeOunces || ''}
                        onChange={(e) => handleChange('sizeOunces', e.target.value)}
                        placeholder="e.g. 12 oz"
                    />

                    <Input
                        label="Category (Optional)"
                        value={product.category || ''}
                        onChange={(e) => handleChange('category', e.target.value)}
                        placeholder="e.g. Functional Beverage"
                    />
                </div>
            </Card>

            <Card className={styles.setupCard}>
                <CardHeader
                    title="Freight & Logistics"
                    subtitle="Set up standard shipping weights, cases, and dimensions to calculate freight costs."
                />
                <div className={styles.formGrid}>
                    <Input
                        label="Cases Per Pallet"
                        type="number"
                        min={1}
                        value={product.casesPerPallet || ''}
                        onChange={(e) => handleChange('casesPerPallet', parseInt(e.target.value) || '')}
                        placeholder="e.g. 100"
                    />
                    <Input
                        label="Weight Per Case (lbs)"
                        type="number"
                        min={0}
                        step="0.01"
                        value={product.weightPerCase || ''}
                        onChange={(e) => handleChange('weightPerCase', parseFloat(e.target.value) || '')}
                        placeholder="e.g. 18.5"
                    />
                    <Input
                        label="Pallets Per Truckload"
                        type="number"
                        min={1}
                        value={product.palletsPerTruckload || ''}
                        onChange={(e) => handleChange('palletsPerTruckload', parseInt(e.target.value) || '')}
                        placeholder="e.g. 26"
                    />
                    <Input
                        label="Pallet Dimensions (L x W x H)"
                        value={product.palletDimensions || ''}
                        onChange={(e) => handleChange('palletDimensions', e.target.value)}
                        placeholder="e.g. 48x40x72"
                    />
                    <Input
                        label="Freight Class / NMFC"
                        value={product.freightClass || ''}
                        onChange={(e) => handleChange('freightClass', e.target.value)}
                        placeholder="e.g. 60"
                    />
                </div>
            </Card>

            <div className={styles.helpBox}>
                <h3>Why this matters</h3>
                <p>The <strong>Units Per Case</strong> is critical. All COGS lines and trade promotions are typically measured per case. Margin Minder will automatically break these down into "per unit" costs for your suggested retail price (SRP) calculations.</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                <button 
                    onClick={handleSave}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: isSaving ? 'var(--color-emerald)' : 'var(--color-primary)',
                        color: 'white', border: 'none', padding: '12px 24px',
                        borderRadius: 'var(--radius-md)', fontWeight: 500, cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    {isSaving ? <Check size={18} /> : null}
                    {isSaving ? 'Saved!' : 'Save Product Setup'}
                </button>
            </div>
        </div>
    );
}
