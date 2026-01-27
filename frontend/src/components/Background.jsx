import { useEffect, useRef } from 'react';

// Ink Particle Class - Simulating "Ripples" (荡漾)
class InkParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 0; // Start small
        this.maxSize = Math.random() * 80 + 40; // Max ripple size
        this.opacity = 0.5; // Starts fainter (was 1)
        // Easing the expansion: fast start, slow end
        this.age = 0;
        this.life = Math.random() * 100 + 100; // longer life

        // Color palette: Very subtle, watery ink colors
        const colors = [
            '100, 149, 237', // Cornflower Blue
            '216, 191, 216', // Thistle (Purple)
            '175, 238, 238', // Pale Turquoise
            '160, 160, 160'  // Light Gray (Ink)
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.age++;
        // Logarithmic growth for "ripple" feel
        const progress = this.age / this.life;
        this.size = this.maxSize * Math.sin(progress * Math.PI / 2); // Ease out

        // Fade out
        this.opacity = 1 - progress;
    }

    draw(ctx) {
        ctx.beginPath();
        // Radial gradient to simulate the ring ripple
        const gradient = ctx.createRadialGradient(
            this.x, this.y, this.size * 0.2, // Inner radius (hole in ripple)
            this.x, this.y, this.size
        );

        // Inner edge (transparent)
        gradient.addColorStop(0, `rgba(${this.color}, 0)`);
        // Middle (ink body) - significantly reduced opacity for "light watercolor" feel
        gradient.addColorStop(0.5, `rgba(${this.color}, ${this.opacity * 0.4})`);
        // Outer edge (fading)
        gradient.addColorStop(1, `rgba(${this.color}, 0)`);

        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
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
            background: 'transparent', // Transparent to let body gradient show
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
