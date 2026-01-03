
export default function Logo({ size = 32, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={{ display: 'block' }}
        >
            {/* Gentle Breeze: Three staggered, flowing lines representing scent on the wind */}

            {/* Top Line - Fade in */}
            <path
                d="M4 10C4 10 9 8 14 10C19 12 22 10 24 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
            />

            {/* Middle Line - Main flow */}
            <path
                d="M8 16C8 16 13 14 18 16C23 18 28 16 28 16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Bottom Line - Fade out */}
            <path
                d="M6 22C6 22 11 20 16 22C21 24 23 23 23 23"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.6"
            />
        </svg>
    );
}
