/**
 * Analyzing Page Component
 * ------------------------
 * Displays a loading animation while the backend processes the user's input.
 * Polls the job status endpoint and redirects to the result page upon completion.
 *
 * @component
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Analyzing() {
    const navigate = useNavigate();
    const location = useLocation();
    const jobId = location.state?.jobId;
    const hasNavigated = useRef(false);

    useEffect(() => {
        if (!jobId) {
            // If no job ID, mock passing through or redirect back (fallback for dev)
            const timer = setTimeout(() => navigate('/result'), 3000); 
            return () => clearTimeout(timer);
        }

        /**
         * Poll job status every second.
         */
        const pollInterval = setInterval(async () => {
            if (hasNavigated.current) return;

            try {
                const job = await api.getJobStatus(jobId);

                if (job.status === 'succeeded') {
                    hasNavigated.current = true;
                    clearInterval(pollInterval);
                    navigate('/result', { state: { jobId } });
                } else if (job.status === 'failed') {
                    hasNavigated.current = true;
                    clearInterval(pollInterval);
                    alert('Analysis failed: ' + (job.error?.message || 'Unknown error'));
                    navigate('/explore');
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 1000);

        return () => clearInterval(pollInterval);
    }, [jobId, navigate]);

    const steps = [
        'Understanding your feeling',
        'Modeling imagery',
        'Mapping fragrance notes',
        'Generating personalized plan'
    ];

    return (
        <div className="container" style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh'
        }}>
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                {/* Minimalist spinner */}
                <div style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 3rem'
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        border: '2px solid hsl(var(--color-border))',
                        borderTopColor: 'hsl(var(--color-accent))',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                </div>

                <h2 className="animate-fade-in-up delay-100" style={{
                    fontWeight: '600',
                    marginBottom: '2rem',
                    fontSize: '1.75rem',
                    letterSpacing: '-0.02em',
                    opacity: 0
                }}>
                    Analyzing your essence
                </h2>

                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                    {steps.map((step, idx) => (
                        <p
                            key={idx}
                            className="animate-fade-in"
                            style={{
                                color: 'hsl(var(--color-text-muted))',
                                fontSize: '0.9375rem',
                                marginBottom: '0.625rem',
                                animationDelay: `${(idx + 2) * 200}ms`,
                                opacity: 0
                            }}
                        >
                            {step}...
                        </p>
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
