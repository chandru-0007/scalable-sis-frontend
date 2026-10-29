import React from 'react';

/**
 * Next.js Image shim for Vite/CRA environments.
 * Allows components using `import Image from "next/image"` to render cleanly without Next.js.
 */
export default function Image({
  src,
  alt = '',
  width,
  height,
  className = '',
  style = {},
  draggable = false,
  priority = false,
  ...rest
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{
        maxWidth: '100%',
        objectFit: 'cover',
        ...style,
      }}
      draggable={draggable}
      loading={priority ? 'eager' : 'lazy'}
      {...rest}
    />
  );
}
