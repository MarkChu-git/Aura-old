export default function Privacy() {
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
                    Privacy Policy
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
                            At AURA, we believe that privacy is the ultimate luxury. We are committed to protecting your personal information and your right to privacy. This Privacy Policy outlines how we collect, use, and safeguard your data when you interact with our AI-driven fragrance discovery platform.
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
                            1. Information We Collect
                        </h2>
                        <p style={{ marginBottom: '1rem' }}>
                            We collect information necessary to provide you with a personalized sensory experience:
                        </p>
                        <ul style={{ listStyle: 'none', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><strong style={{ color: 'hsl(var(--color-text-main))' }}>• Sensory Inputs:</strong> Text descriptions, memories, and images you upload to generate fragrance profiles.</li>
                            <li><strong style={{ color: 'hsl(var(--color-text-main))' }}>• Usage Data:</strong> Information on how you interact with our platform, including preferences and navigation paths.</li>
                            <li><strong style={{ color: 'hsl(var(--color-text-main))' }}>• Device Information:</strong> Technical data such as IP address, browser type, and operating system to ensure optimal performance.</li>
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
                            2. How We Use Your Information
                        </h2>
                        <p>
                            Your data acts as the raw material for our alchemical process. We use it strictly to:
                        </p>
                        <ul style={{ listStyle: 'none', paddingLeft: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>• Analyzing your inputs to generate personalized fragrance algorithms.</li>
                            <li>• improving the accuracy of our AI sensory models.</li>
                            <li>• Communicating with you regarding your personalized results and platform updates.</li>
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
                            3. Data Security & Storage
                        </h2>
                        <p>
                            We employ enterprise-grade encryption and security protocols to protect your data. Your sensory inputs are processed anonymously where possible. We do not sell your personal data to third parties. Images uploaded for analysis are processed transiently and are not permanently stored on our servers without your explicit consent.
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
                            4. Your Rights
                        </h2>
                        <p>
                            You have sovereignty over your digital essence. You have the right to:
                        </p>
                        <ul style={{ listStyle: 'none', paddingLeft: '1rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>• Access the personal data we hold about you.</li>
                            <li>• Request the deletion of your data ("The Right to be Forgotten").</li>
                            <li>• Opt-out of data processing for AI training purposes.</li>
                        </ul>
                    </div>

                    <div style={{
                        marginTop: '2rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid hsl(var(--color-border))'
                    }}>
                        <p>
                            For privacy-related inquiries, please contact our Data Protection Officer at privacy@aura.ai.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
