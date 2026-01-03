import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Brain, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import LiquidButton from '../components/LiquidButton';

export default function Home() {
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="container">
            {/* Hero Section */}
            <section className="section" style={{
                textAlign: 'center',
                padding: '12rem 0 10rem',
                position: 'relative'
            }}>
                {/* Subtle fragrance mist effect */}
                <div style={{
                    position: 'absolute',
                    top: '15%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '2px',
                    height: '80px',
                    background: 'linear-gradient(to bottom, transparent, hsl(var(--color-fragrance) / 0.12), transparent)',
                    animation: 'mist 4s ease-in-out infinite'
                }} />

                <div className="animate-fade-in-up">
                    <h1 style={{
                        fontSize: 'clamp(3rem, 7vw, 5.5rem)',
                        fontWeight: '400',
                        lineHeight: 1.1,
                        marginBottom: '2rem',
                        letterSpacing: '-0.02em',
                        fontFamily: 'Georgia, serif'
                    }}>
                        Explore fragrance <br />
                        through <span
                            className="gradient-text-interactive"
                            style={{
                                fontSize: '1.05em',
                                background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, #667eea 0%, #764ba2 50%, #f093fb 100%)`,
                                backgroundSize: '200% 200%'
                            }}
                        >feeling</span>
                    </h1>
                </div>

                <p className="animate-fade-in-up delay-100" style={{
                    fontSize: '1.125rem',
                    color: 'hsl(var(--color-text-muted))',
                    maxWidth: '560px',
                    margin: '0 auto 3.5rem',
                    lineHeight: '1.8',
                    fontWeight: '300',
                    fontFamily: 'Georgia, serif'
                }}>
                    Transform vague sensations into understandable fragrance solutions
                </p>

                <div className="animate-fade-in-up delay-200">
                    <LiquidButton to="/chat" className="btn-primary" style={{ fontFamily: 'var(--font-sans)' }}>
                        Begin Your Journey <ArrowRight size={16} />
                    </LiquidButton>
                </div>
            </section>

            {/* Process Section */}
            <section className="section" style={{
                borderTop: '1px solid hsl(var(--color-border))',
                paddingTop: '7rem'
            }}>
                <h2 className="animate-fade-in" style={{
                    fontSize: '2.5rem',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    fontWeight: '400',
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '-0.02em'
                }}>
                    How it works
                </h2>
                <p className="animate-fade-in delay-100" style={{
                    textAlign: 'center',
                    color: 'hsl(var(--color-text-muted))',
                    marginBottom: '5rem',
                    fontSize: '0.9375rem',
                    fontFamily: 'Georgia, serif'
                }}>
                    A refined approach to fragrance discovery
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1100px',
                    margin: '0 auto'
                }}>
                    {[
                        {
                            step: 'I',
                            icon: Sparkles,
                            title: 'Describe',
                            desc: 'Share a feeling, memory, or imagery you cherish'
                        },
                        {
                            step: 'II',
                            icon: Brain,
                            title: 'Analyze',
                            desc: 'Our system decodes your input into sensory data'
                        },
                        {
                            step: 'III',
                            icon: Package,
                            title: 'Discover',
                            desc: 'Receive a personalized fragrance plan'
                        }
                    ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={idx}
                                className={`card animate-fade-in-up delay-${(idx + 2) * 100}`}
                                style={{
                                    textAlign: 'center',
                                    opacity: 0,
                                    padding: '2rem 1.5rem 2.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    margin: '0 auto 1.5rem',
                                    background: 'hsl(var(--color-text-main) / 0.03)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Icon size={20} style={{ color: 'hsl(var(--color-text-main))' }} />
                                </div>
                                <span style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    color: 'hsl(var(--color-text-muted))',
                                    marginBottom: '1rem',
                                    fontWeight: '400',
                                    letterSpacing: '0.15em',
                                    fontFamily: 'Georgia, serif'
                                }}>
                                    {item.step}
                                </span>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: '0.75rem',
                                    fontWeight: '500',
                                    fontFamily: 'Georgia, serif',
                                    letterSpacing: '-0.01em'
                                }}>
                                    {item.title}
                                </h3>
                                <p style={{
                                    color: 'hsl(var(--color-text-muted))',
                                    lineHeight: '1.6',
                                    fontSize: '0.9375rem',
                                    fontWeight: '300',
                                    maxWidth: '240px',
                                    fontFamily: 'Georgia, serif'
                                }}>
                                    {item.desc}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Trust Section */}
            <section className="section" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <div className="liquid-glass animate-fade-in" style={{
                    maxWidth: '700px',
                    margin: '0 auto',
                    padding: '3rem 2.5rem',
                    borderRadius: '1.25rem',
                    opacity: 0
                }}>
                    <p style={{
                        fontSize: '1.25rem',
                        lineHeight: '1.9',
                        color: 'hsl(var(--color-text-muted))',
                        fontFamily: 'Georgia, serif',
                        fontWeight: '400',
                        fontStyle: 'italic'
                    }}>
                        Every recommendation is explainable. <br />
                        We believe in transparency and understanding, not just algorithms.
                    </p>
                </div>
            </section>
        </div>
    );
}
