import React from 'react';

export interface ImageWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Unified ImageWrapper specification:
 * - Exactly 16px border-radius
 * - Clean overflow clipping with Webkit mask & isolation
 * - Zero background, zero border, zero outline, zero shadow
 * - Children (img) inherit border-radius
 */
export const ImageWrapper: React.FC<ImageWrapperProps> = ({
  children,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className={`image-wrapper ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export default ImageWrapper;
