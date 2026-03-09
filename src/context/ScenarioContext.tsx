import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Scenario, CalculationResult } from '../types';
import { calculateEconomics } from '../engine/calculations';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MockDB } from '../api/mockDb';
import { useAuth } from './AuthContext';

interface ScenarioContextType {
    activeScenario: Scenario;
    scenarios: Scenario[];
    results: CalculationResult;
    saveScenario: (scenario: Scenario) => void;
    updateActiveScenario: (scenario: Scenario | ((prev: Scenario) => Scenario)) => void;
    switchScenario: (id: string) => void;
    deleteScenario: (id: string) => void;
    duplicateScenario: (id: string) => void;
    resetToDefaults: () => void;
    isPresentationMode: boolean;
    togglePresentationMode: () => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export function ScenarioProvider({ children, productId }: { children: ReactNode, productId: string }) {
    const { user } = useAuth();

    // Each product gets its own storage key for isolated scenarios
    const storageKey = `cpg-scenarios-${productId}`;
    const [scenarios, setScenarios] = useLocalStorage<Scenario[]>(storageKey, []);
    const [activeScenarioId, setActiveScenarioId] = useLocalStorage<string>(`cpg-active-scenario-${productId}`, '');

    // Derived presentation mode based on role
    const isPresentationMode = user?.role !== 'admin' && user?.role !== 'super_admin';

    // Initialize default scenario if empty
    useEffect(() => {
        if (scenarios.length === 0) {
            // Find the product to build the default scenario
            const allProducts = MockDB.getProducts(''); // For mock DB, we can just fetch the product from storage if we had a getProductById
            // We'll just read from localStorage directly or pass it down via MockDB.
            // Let's create a generic default
            const defaultScen: Scenario = {
                id: uuidv4(),
                productId: productId,
                name: 'Base Scenario (Default)',
                product: { id: productId, companyId: '', name: 'Product', sku: 'SKU', casePack: 12 },
                cogs: {
                    inputMethod: 'total',
                    totalCaseCost: 10.00,
                    lineItems: []
                },
                margins: {
                    targetManufacturerMargin: 40,
                    distributorMargin: 25,
                    retailerMargin: 35,
                    freightAllowance: 2,
                    tradeSpend: 5,
                    variableSellingExpense: 0,
                    brokerFee: 5
                },
                promotions: [],
                slottingFees: [],
                lastModified: Date.now()
            };

            setScenarios([defaultScen]);
            setActiveScenarioId(defaultScen.id);
        }
    }, [scenarios.length, productId, setScenarios, setActiveScenarioId]);

    const activeScenario = useMemo(() => {
        return scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
    }, [scenarios, activeScenarioId]);

    const results = useMemo(() => {
        if (!activeScenario) return null;
        return calculateEconomics(activeScenario);
    }, [activeScenario]);

    const saveScenario = (scenario: Scenario) => {
        setScenarios(prev => {
            const exists = prev.find(s => s.id === scenario.id);
            if (exists) {
                return prev.map(s => s.id === scenario.id ? { ...scenario, lastModified: Date.now() } : s);
            }
            return [...prev, { ...scenario, lastModified: Date.now() }];
        });
    };

    const updateActiveScenario = (updater: Scenario | ((prev: Scenario) => Scenario)) => {
        if (!activeScenario) return;
        const updated = typeof updater === 'function' ? updater(activeScenario) : updater;
        saveScenario({ ...updated, lastModified: Date.now() });
    };

    const switchScenario = (id: string) => {
        const exists = scenarios.find(s => s.id === id);
        if (exists) {
            setActiveScenarioId(id);
        }
    };

    const deleteScenario = (id: string) => {
        setScenarios(prev => {
            const remaining = prev.filter(s => s.id !== id);
            if (remaining.length === 0) {
                const reset: Scenario = { ...activeScenario!, id: uuidv4(), name: 'Base Scenario (Default)', lastModified: Date.now() };
                setActiveScenarioId(reset.id);
                return [reset];
            }
            if (activeScenarioId === id) {
                setActiveScenarioId(remaining[0].id);
            }
            return remaining;
        });
    };

    const duplicateScenario = (id: string) => {
        const source = scenarios.find(s => s.id === id);
        if (source) {
            const newScenario: Scenario = {
                ...source,
                id: uuidv4(),
                name: `${source.name} (Copy)`,
                lastModified: Date.now()
            };
            setScenarios(prev => [...prev, newScenario]);
            setActiveScenarioId(newScenario.id);
        }
    };

    const resetToDefaults = () => {
        if (!activeScenario) return;
        const reset: Scenario = { ...activeScenario, id: uuidv4(), name: 'Base Scenario (Default)', lastModified: Date.now() };
        setScenarios([reset]);
        setActiveScenarioId(reset.id);
    };

    const togglePresentationMode = () => {
        // No-op, managed by roles now
    };

    // Prevent rendering children until activeScenario is generated
    if (!activeScenario || !results) return null;

    return (
        <ScenarioContext.Provider
            value={{
                activeScenario,
                scenarios,
                results,
                saveScenario,
                updateActiveScenario,
                switchScenario,
                deleteScenario,
                duplicateScenario,
                resetToDefaults,
                isPresentationMode,
                togglePresentationMode
            }}
        >
            {children}
        </ScenarioContext.Provider>
    );
}

export function useScenario() {
    const context = useContext(ScenarioContext);
    if (context === undefined) {
        throw new Error('useScenario must be used within a ScenarioProvider');
    }
    return context;
}
