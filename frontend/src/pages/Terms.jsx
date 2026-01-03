export default function Terms() {
    return (
        <div className="container">
            <section className="section" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '8rem' }}>
                <h1 className="animate-fade-in-up" style={{
                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                    fontWeight: '400',
                    marginBottom: '3rem',
                    fontFamily: 'var(--font-serif)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2
                }}>
                    Terms of Service
                </h1>

                <div className="animate-fade-in-up delay-100" style={{
                    color: 'hsl(var(--color-text-muted))',
                    lineHeight: '1.8',
                    fontSize: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2.5rem'
                }}>
                    <div>
                        <p style={{ marginBottom: '1.5rem', fontSize: '1.125rem', color: 'hsl(var(--color-text-main))' }}>
                            Last updated: January 2, 2026
                        </p>
                        <p>
                            Welcome to AURA. By accessing or using our website and AI services, you agree to be bound by these Terms of Service. Please read them carefully. These terms constitute a legally binding agreement between you and AURA AI Labs, Inc.
                        </p>
                    </div>

                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            color: 'hsl(var(--color-text-main))',
                            marginBottom: '1rem',
                            fontFamily: 'var(--font-serif)',
                            fontWeight: '500'
                        }}>
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By creating an account, accessing, or using the Service, you confirm that you can form a binding contract with AURA, that you accept these Terms and that you agree to comply with them. Your access to the Service is also subject to our Privacy Policy.
                        </p>
                    </div>

                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            color: 'hsl(var(--color-text-main))',
                            marginBottom: '1rem',
                            fontFamily: 'var(--font-serif)',
                            fontWeight: '500'
                        }}>
                            2. AI-Generated Content
                        </h2>
                        <p>
                            The AURA platform utilizes advanced artificial intelligence to analyze sensory inputs and generate fragrance recommendations. You acknowledge that:
                        </p>
                        <ul style={{ listStyle: 'none', paddingLeft: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><strong style={{ color: 'hsl(var(--color-text-main))' }}>• Subjectivity:</strong> Fragrance is subjective. AI recommendations are interpretations based on data and may not perfectly predict individual olfactory preference.</li>
                            <li><strong style={{ color: 'hsl(var(--color-text-main))' }}>• Accuracy:</strong> While we strive for precision, we do not guarantee that the AI analysis will be error-free or completely accurate.</li>
                            <li><strong style={{ color: 'hsl(var(--color-text-main))' }}>• Usage:</strong> The results are for personal discovery and informational purposes only.</li>
                        </ul>
                    </div>

                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            color: 'hsl(var(--color-text-main))',
                            marginBottom: '1rem',
                            fontFamily: 'var(--font-serif)',
                            fontWeight: '500'
                        }}>
                            3. Intellectual Property
                        </h2>
                        <p>
                            All content available on AURA, including but not limited to text, graphics, logos, button icons, images, audio clips, data compilations, software, and the compilation thereof is the property of AURA or its content suppliers and is protected by international copyright laws.
                        </p>
                    </div>

                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            color: 'hsl(var(--color-text-main))',
                            marginBottom: '1rem',
                            fontFamily: 'var(--font-serif)',
                            fontWeight: '500'
                        }}>
                            4. Limitation of Liability
                        </h2>
                        <p>
                            To the fullest extent permitted by applicable law, AURA shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                        </p>
                    </div>

                    <div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            color: 'hsl(var(--color-text-main))',
                            marginBottom: '1rem',
                            fontFamily: 'var(--font-serif)',
                            fontWeight: '500'
                        }}>
                            5. Changes to Terms
                        </h2>
                        <p>
                            We reserve the right to modify these specific terms at any time. We will provide notice of significant changes by posting the new Terms on this site. Your continued use of the Service after any such changes constitutes your acceptance of the new Terms.
                        </p>
                    </div>

                    <div style={{
                        marginTop: '2rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid hsl(var(--color-border))'
                    }}>
                        <p>
                            Questions regarding these Terms should be sent to legal@aura.ai.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
