import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import styles from './ProductSetup.module.css';

export function ProductSetup() {
    const { activeScenario, updateActiveScenario } = useScenario();
    const { product } = activeScenario;

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

            <div className={styles.helpBox}>
                <h3>Why this matters</h3>
                <p>The <strong>Units Per Case</strong> is critical. All COGS lines and trade promotions are typically measured per case. Margin Minder will automatically break these down into "per unit" costs for your suggested retail price (SRP) calculations.</p>
            </div>
        </div>
    );
}
