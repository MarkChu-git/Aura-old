/**
 * Liquid Button Component
 * -----------------------
 * A button component with a unique "liquid" hover effect.
 * Can function as a standard button or a React Router Link.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Button content.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {string} [props.to] - URL path (if using as a Link).
 * @param {Function} [props.onClick] - Click handler.
 * @param {boolean} [props.disabled] - Disabled state.
 * @param {string} [props.type='button'] - Button type.
 * @param {Object} [props.style] - Inline styles.
 */

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function LiquidButton({ children, className = '', to, onClick, disabled, type = 'button', style = {} }) {
    const buttonRef = useRef(null);
    const [position, setPosition] = useState({ x: 50, y: 50 });

    /**
     * Track mouse position relative to button for the liquid effect.
     * @param {MouseEvent} e - Mouse event.
     */
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
