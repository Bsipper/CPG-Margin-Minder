import React, { useState, useRef, useEffect } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { Card, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Send, Settings, Sparkles, Loader2, KeyRound } from 'lucide-react';
import styles from './AIChatBox.module.css';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export function AIChatBox() {
    const { activeScenario, results } = useScenario();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // BYOK Settings
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('MARGIN_MINDER_OPENAI_KEY') || '');
    const [showSettings, setShowSettings] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const saveApiKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem('MARGIN_MINDER_OPENAI_KEY', key);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // System context string containing live data that the AI needs to answer margin questions
    const buildSystemContext = () => {
        const sc = activeScenario;
        const b = results.base;
        const p = results.profitability;

        return `
You are Margin Minder AI, an expert CPG (Consumer Packaged Goods) financial advisor and pricing strategist. 
The user will ask you questions about their pricing, margins, or trade spend. Use the data below to advise them.

CURRENT CONTEXT:
Product: ${sc.product.name} (SKU: ${sc.product.sku})
Case Pack Size: ${sc.product.casePack} units per case

COSTS (AVERAGE COGS):
Total Avg COGS Per Case: $${b.cogsPerCase.toFixed(2)}
Total Avg COGS Per Unit: $${b.cogsPerUnit.toFixed(2)}

CURRENT MARGINS & PRICING:
1. Target Manufacturer Gross Margin: ${sc.margins.targetManufacturerMargin}%
   - Wholesale Price to Distributor: $${b.manufacturerSellPriceToDistributor.toFixed(2)} / case
   - Manufacturer Gross Profit: $${p.manufacturerGrossProfitDollars.toFixed(2)} / case

2. Target Distributor Margin: ${sc.margins.distributorMargin}%
   - Price to Retailer: $${b.distributorPriceToRetailer.toFixed(2)} / case

3. Target Retailer Margin: ${sc.margins.retailerMargin}%
   - Suggested Retail Price (SRP) Per Case: $${b.retailPricePerCase.toFixed(2)}
   - SRP Per Unit: $${b.suggestedRetailPricePerUnit.toFixed(2)}

RULES:
- Be concise. Give exact numbers. 
- Use standard CPG math: Price = Cost / (1 - Margin Percentage). Example: If cost is $10 and margin is 40%, price is $10 / (1 - 0.40) = $16.67.
- If they ask "What do my margins need to be to reach $X SRP?", hold the other tiers constant and calculate backwards.
- Format currency cleanly: $1.99.
    `.trim();
    };

    const handleSend = async () => {
        if (!inputText.trim() || !apiKey) return;

        const newUserMsg: Message = { role: 'user', content: inputText };
        setMessages(prev => [...prev, newUserMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            // For this purely client-side browser app, we call OpenAI directly using fetch to avoid Node bundle polyfill issues.
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    temperature: 0.1, // Keep it highly analytical and exact
                    messages: [
                        { role: 'system', content: buildSystemContext() },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: newUserMsg.role, content: newUserMsg.content }
                    ]
                })
            });

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: data.choices[0].message.content }
            ]);

        } catch (err: any) {
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: `[Error communicating with AI: ${err.message}]` }
            ]);
            // If unauthorized, pop settings back open
            if (err.message.toLowerCase().includes('api key') || err.message.toLowerCase().includes('unauthorized')) {
                setShowSettings(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className={styles.container}>
            <CardHeader
                title="Margin AI Advisor"
                subtitle="Ask context-aware questions about your pricing strategy."
            />

            {showSettings && (
                <div className={styles.settingsPanel}>
                    <p className={styles.settingsExplainer}>
                        To use the AI Advisor, please provide your OpenAI API Key. <br />
                        (This key is never sent to our servers, it is stored securely in your browser's local storage).
                    </p>
                    <div className={styles.keyRow}>
                        <KeyRound size={18} className={styles.keyIcon} />
                        <Input
                            type="password"
                            placeholder="sk-..."
                            value={apiKey}
                            onChange={(e) => saveApiKey(e.target.value)}
                            className={styles.keyInput}
                        />
                        <button onClick={() => setShowSettings(false)} className={styles.closeSettingsBtn} disabled={!apiKey}>
                            Save
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.chatArea}>
                {messages.length === 0 && !showSettings && (
                    <div className={styles.emptyChat}>
                        <Sparkles size={32} className={styles.emptyIcon} />
                        <p>Example: "If I want the unit SRP to be $1.99, what should my Manufacturer Margin drop to?"</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={msg.role === 'user' ? styles.msgUser : styles.msgAI}>
                        <p>{msg.content}</p>
                    </div>
                ))}
                {isLoading && (
                    <div className={styles.msgAI}>
                        <Loader2 className={styles.spinner} size={16} /> <span style={{ marginLeft: 8 }}>Analyzing...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                <button className={styles.settingsToggle} onClick={() => setShowSettings(!showSettings)} title="API Settings">
                    <Settings size={18} />
                </button>
                <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={apiKey ? "Ask a pricing question..." : "Enter API key to start..."}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={!apiKey || isLoading}
                    className={styles.chatInput}
                />
                <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={!inputText.trim() || !apiKey || isLoading}
                >
                    <Send size={18} />
                </button>
            </div>
        </Card>
    );
}
