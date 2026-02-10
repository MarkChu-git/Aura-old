import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Image, Type, Sparkles } from 'lucide-react';
import LiquidButton from '../components/LiquidButton';
import { api } from '../services/api';

export default function Explore() {
    const { t, i18n } = useTranslation();
    const [mode, setMode] = useState('text');
    const [inputValue, setInputValue] = useState('');
    const navigate = useNavigate();

    const isChinese = i18n.language.startsWith('zh');
    const serifFont = isChinese ? 'var(--font-serif-cn)' : 'var(--font-serif)';

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleStartAnalysis = async () => {
        if (!inputValue) return;

        setIsLoading(true);
        setError(null);
        try {
            // Hardcoded for 'text' mode MVP, extend for image later
            const data = await api.analyzeText(inputValue);
            navigate('/analyzing', { state: { jobId: data.job_id } });
        } catch (err) {
            console.error(err);
            setError(t('explore.errors.failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const exampleTags = ['Rainy Forest', 'Warm Blanket', 'Crisp Morning', 'Old Library', 'Ocean Breeze', 'Cozy Fireplace'];

    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <section className="section" style={{ paddingTop: '10rem' }}>
                <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                        fontWeight: '300',
                        letterSpacing: '-0.01em',
                        fontFamily: serifFont
                    }}>
                        {t('explore.hero.title')}
                    </h1>
                    <p style={{
                        fontSize: '1.0625rem',
                        color: 'hsl(var(--color-text-muted))',
                        maxWidth: '600px',
                        margin: '0 auto',
                        fontWeight: '300'
                    }}>
                        {t('explore.hero.subtitle')}
                    </p>
                </div>

                {/* Mode Switch */}
                <div className="animate-fade-in delay-100" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    marginBottom: '3rem',
                    opacity: 0
                }}>
                    <LiquidButton
                        onClick={() => setMode('text')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            background: mode === 'text' ? 'rgba(10, 10, 10, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                            color: mode === 'text' ? 'white' : 'hsl(var(--color-text-main))',
                            border: '1px solid',
                            borderColor: mode === 'text' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Type size={18} /> {t('explore.modes.text')}
                    </LiquidButton>
                    <LiquidButton
                        onClick={() => setMode('image')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.75rem',
                            background: mode === 'image' ? 'rgba(10, 10, 10, 0.6)' : 'rgba(255, 255, 255, 0.6)',
                            color: mode === 'image' ? 'white' : 'hsl(var(--color-text-main))',
                            border: '1px solid',
                            borderColor: mode === 'image' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <Image size={18} /> {t('explore.modes.image')}
                    </LiquidButton>
                </div>

                {/* Input Area */}
                <div className="card animate-scale-in delay-200" style={{
                    minHeight: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    opacity: 0
                }}>
                    {mode === 'text' ? (
                        <div>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={t('explore.textInput.placeholder')}
                                    style={{
                                        width: '100%',
                                        height: '250px',
                                        border: 'none',
                                        fontSize: '1.125rem',
                                        resize: 'none',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        color: 'hsl(var(--color-text-main))',
                                        background: 'transparent',
                                        lineHeight: '1.7'
                                    }}
                                />
                            </div>
                            <div style={{
                                marginTop: '2rem',
                                paddingTop: '2rem',
                                borderTop: '1px solid hsl(var(--color-border))'
                            }}>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: 'hsl(var(--color-text-muted))',
                                    marginBottom: '1rem'
                                }}>
                                    {t('explore.textInput.examples')}
                                </p>
                                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                                    {exampleTags.map((tag, idx) => (
                                        <button
                                            key={tag}
                                            onClick={() => setInputValue(tag)}
                                            className="animate-fade-in"
                                            style={{
                                                fontSize: '0.875rem',
                                                padding: '0.625rem 1rem',
                                                borderRadius: '0.625rem',
                                                backgroundColor: 'hsl(var(--color-bg))',
                                                color: 'hsl(var(--color-text-main))',
                                                border: '1px solid hsl(var(--color-border))',
                                                fontWeight: '400',
                                                animationDelay: `${idx * 50}ms`,
                                                opacity: 0
                                            }}
                                        >
                                            {t(`explore.tags.${tag}`, tag)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                border: '2px dashed hsl(var(--color-border))',
                                padding: '4rem 2rem',
                                borderRadius: '1rem',
                                color: 'hsl(var(--color-text-muted))',
                                cursor: 'pointer',
                                transition: 'all var(--transition-base)',
                                background: 'hsl(var(--color-bg))'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'hsl(var(--color-accent))';
                                    e.currentTarget.style.background = 'hsl(var(--color-accent) / 0.03)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'hsl(var(--color-border))';
                                    e.currentTarget.style.background = 'hsl(var(--color-bg))';
                                }}
                            >
                                <Image size={56} style={{
                                    marginBottom: '1.5rem',
                                    opacity: 0.3,
                                    margin: '0 auto 1.5rem'
                                }} />
                                <p style={{ fontSize: '1.0625rem', marginBottom: '0.5rem', color: 'hsl(var(--color-text-main))' }}>
                                    {t('explore.imageInput.upload')}
                                </p>
                                <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
                                    {t('explore.imageInput.description')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action */}
                <div className="animate-fade-in delay-300" style={{
                    marginTop: '2.5rem',
                    textAlign: 'center',
                    opacity: 0
                }}>
                    <LiquidButton
                        onClick={handleStartAnalysis}
                        className="btn-primary"
                        disabled={(mode === 'text' && !inputValue) || isLoading}
                        style={{
                            opacity: ((mode === 'text' && !inputValue) || isLoading) ? 0.5 : 1,
                            cursor: ((mode === 'text' && !inputValue) || isLoading) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Sparkles size={18} />
                        {isLoading ? t('explore.actions.connecting') : t('explore.actions.analyze')}
                    </LiquidButton>
                    {error && (
                        <p className="animate-fade-in" style={{
                            marginTop: '1rem',
                            color: 'hsl(var(--color-accent))',
                            fontSize: '0.875rem'
                        }}>
                            {error}
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}
