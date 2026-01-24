import { useEffect, useRef } from 'react';

// Ink Particle Class - Simulating "Ripples" (荡漾)
class InkParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 20 + 10; // Random size
        this.opacity = 0.8; // Initial opacity
        this.growth = 0.5; // Growth rate
        this.fade = 0.015; // Fade rate
    }

    update() {
        this.size += this.growth;
        this.opacity -= this.fade;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity * 0.08})`; // Very faint, smoky look
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Inner ring to make it look like a ripple
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(0, 0, 0, ${this.opacity * 0.05})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.stroke();
    }
}

export default function Background() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();



        const handleMouseMove = (e) => {
            // Spawn ink drops more frequently only if mouse moves fast? 
            // For now, spawn freely but limit count to avoid lag
            if (particles.length < 100) {
                // Random chance to spawn to make it less like a solid line
                if (Math.random() > 0.5) {
                    particles.push(new InkParticle(e.clientX, e.clientY));
                }
            }
        };

        const animate = () => {
            // Clear but leave trails? No, for ink wash we want accumulation or clear?
            // "Interactive" usually implies clearing. 
            // But real ink stays. 
            // Let's try attempting a "fading canvas" effect for trails.

            // Clear canvas completely each frame for now to simulate floating ink
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Optional: Draw a base subtle background gradient
            // ctx.fillStyle = 'rgba(255, 255, 255, 0.)'; // or theme bg

            // Draw all particles
            particles.forEach((p, index) => {
                p.update();
                p.draw(ctx);

                // Remove dead particles
                if (p.opacity <= 0) {
                    particles.splice(index, 1);
                }
            });

            // Ambient ink blobs (optional, for background life)
            // ...

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            background: 'hsl(var(--color-bg))', // Base canvas color
            overflow: 'hidden'
        }}>
            {/* The Blur Filter is CRITICAL for the "Ink Wash" look */}
            <canvas
                ref={canvasRef}
                style={{
                    filter: 'blur(30px) contrast(1.2)', // Blurs the particles together
                    opacity: 0.8 // Blend with background
                }}
            />

            {/* Texture Overlay for Paper effect */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.05,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                pointerEvents: 'none'
            }} />
        </div>
    );
}
