import { Share2, Heart, ExternalLink, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LiquidButton from '../components/LiquidButton';
import { api } from '../services/api';

export default function Result() {
    const [favorites, setFavorites] = useState(new Set());

    const toggleFavorite = (id) => {
        setFavorites(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const location = useLocation();
    const jobId = location.state?.jobId;
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!jobId) {
                setLoading(false);
                return; // Fallback to mock if no ID (dev mode)
            }

            try {
                const response = await api.getResults(jobId);
                // Unwrap the { data: ... } envelope from backend
                setResultData(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [jobId]);

    // Use API data or fallback mock for dev
    const summaryText = resultData?.summary || 'Based on "Rainy Forest", we detected a need for calm, grounding, and fresh scents with notes of wet wood and ozone.';
    const extractedTags = resultData?.extracted_tags?.extracted_keywords || ['Calm', 'Woody', 'Fresh', 'Ozone', 'Grounding'];

    // Transform API recommendations to view model
    const displayRecommendations = (resultData && resultData.recommendations && resultData.recommendations.length > 0) ? [
        {
            category: 'Your Matches',
            items: resultData.recommendations.map(rec => ({
                id: rec.sku.id,
                name: rec.sku.name,
                brand: rec.sku.brand,
                reason: rec.reason_short,
                url: rec.sku.url
            }))
        }
    ] : [
        {
            category: 'Perfume', items: [
                { id: 'p1', name: 'Mist & Cedar', brand: 'Aesop', reason: 'Matches "Rainy Forest" damp, woodsy feel with earthy undertones.' },
                { id: 'p2', name: 'Hinoki', brand: 'Le Labo', reason: 'Resinous notes create a calm, meditative atmosphere.' },
                { id: 'p3', name: 'Tam Dao', brand: 'Diptyque', reason: 'Sandalwood depth perfect for quiet reflection.' }
            ]
        }
    ];

    if (loading) return <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>Loading essence...</div>;

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <section className="section">
                {/* Analysis Summary */}
                <div className="liquid-glass animate-fade-in-up" style={{
                    padding: '2.5rem',
                    borderRadius: '1.25rem',
                    marginBottom: '4rem',
                    opacity: 0
                }}>
                    <h1 style={{
                        fontSize: '2.25rem',
                        fontWeight: '300',
                        marginBottom: '1.5rem',
                        letterSpacing: '-0.01em',
                        fontFamily: 'var(--font-serif)'
                    }}>
                        Your Fragrance Plan
                    </h1>

                    <p style={{
                        maxWidth: '700px',
                        marginBottom: '1.5rem',
                        fontSize: '1.0625rem',
                        lineHeight: '1.7',
                        color: 'hsl(var(--color-text-muted))',
                        fontWeight: '300'
                    }}>
                        Based on <strong style={{ color: 'hsl(var(--color-text-main))' }}>your input</strong>, {summaryText}
                    </p>

                    <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                        {extractedTags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="animate-fade-in"
                                style={{
                                    backgroundColor: 'hsl(var(--color-accent) / 0.08)',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.625rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    color: 'hsl(var(--color-accent))',
                                    border: '1px solid hsl(var(--color-accent) / 0.15)',
                                    animationDelay: `${idx * 100}ms`,
                                    opacity: 0
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div style={{ display: 'grid', gap: '4rem' }}>
                    {displayRecommendations.map((cat, catIdx) => (
                        <div key={catIdx} className="animate-fade-in-up" style={{
                            opacity: 0,
                            animationDelay: `${(catIdx + 2) * 100}ms`
                        }}>
                            <h2 style={{
                                fontSize: '1.875rem',
                                marginBottom: '2rem',
                                fontWeight: '300',
                                color: 'hsl(var(--color-text-main))',
                                fontFamily: 'var(--font-serif)',
                                letterSpacing: '-0.01em'
                            }}>
                                {cat.category}
                            </h2>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {cat.items.map((item, itemIdx) => {
                                    const isFavorited = favorites.has(item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            className="card animate-fade-in"
                                            style={{
                                                position: 'relative',
                                                animationDelay: `${(catIdx + 2) * 100 + itemIdx * 100}ms`,
                                                opacity: 0
                                            }}
                                        >
                                            <button
                                                onClick={() => toggleFavorite(item.id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '1.5rem',
                                                    right: '1.5rem',
                                                    padding: '0.5rem',
                                                    borderRadius: '50%',
                                                    background: isFavorited ? 'hsl(var(--color-accent) / 0.08)' : 'transparent'
                                                }}
                                            >
                                                <Heart
                                                    size={18}
                                                    style={{
                                                        color: isFavorited ? 'hsl(var(--color-accent))' : 'hsl(var(--color-text-muted))',
                                                        fill: isFavorited ? 'hsl(var(--color-accent))' : 'none',
                                                        transition: 'all var(--transition-base)'
                                                    }}
                                                />
                                            </button>

                                            <h3 style={{
                                                fontSize: '1.5rem',
                                                marginBottom: '0.5rem',
                                                fontWeight: '400',
                                                fontFamily: 'var(--font-serif)',
                                                letterSpacing: '-0.01em'
                                            }}>
                                                {item.name}
                                            </h3>

                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: 'hsl(var(--color-text-muted))',
                                                marginBottom: '1.25rem',
                                                fontWeight: '500'
                                            }}>
                                                {item.brand}
                                            </p>

                                            <p style={{
                                                fontSize: '0.9375rem',
                                                lineHeight: '1.6',
                                                color: 'hsl(var(--color-text-muted))',
                                                marginBottom: '1.5rem'
                                            }}>
                                                {item.reason}
                                            </p>

                                            <a
                                                href="#"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.375rem',
                                                    fontSize: '0.875rem',
                                                    color: 'hsl(var(--color-accent))',
                                                    fontWeight: '500',
                                                    paddingTop: '1rem',
                                                    borderTop: '1px solid hsl(var(--color-border))'
                                                }}
                                            >
                                                View Details <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="animate-fade-in delay-500" style={{
                    marginTop: '4rem',
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    opacity: 0
                }}>
                    <LiquidButton to="/explore" className="btn-primary">
                        <Sparkles size={18} /> Explore Again
                    </LiquidButton>
                    <LiquidButton
                        style={{
                            padding: '0.875rem 2rem',
                            background: 'rgba(255, 255, 255, 0.6)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                            fontSize: '1rem',
                            color: 'hsl(var(--color-text-main))'
                        }}
                    >
                        <Share2 size={18} /> Share
                    </LiquidButton>
                </div>
            </section>
        </div>
    );
}
