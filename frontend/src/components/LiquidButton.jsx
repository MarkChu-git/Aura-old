import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LiquidButton({ children, className = '', to, onClick, disabled, type = 'button', style = {} }) {
    const buttonRef = useRef(null);
    const [position, setPosition] = useState({ x: 50, y: 50 });

    const handleMouseMove = (e) => {
        if (!buttonRef.current) return;

        // Get position relative to the button
        const rect = buttonRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setPosition({ x, y });
    };

    const cssVariables = {
        '--x': `${position.x}%`,
        '--y': `${position.y}%`,
        ...style
    };

    const commonProps = {
        ref: buttonRef,
        className: `liquid-btn ${className}`,
        onMouseMove: handleMouseMove,
        style: cssVariables
    };

    if (to) {
        return (
            <Link to={to} {...commonProps}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            {...commonProps}
        >
            {children}
        </button>
    );
}
