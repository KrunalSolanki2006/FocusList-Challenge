import React from 'react';

const visuallyHiddenStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0'
};

export function VisuallyHidden({ children, as: Component = 'span', ...props }) {
  return (
    <Component style={visuallyHiddenStyles} {...props}>
      {children}
    </Component>
  );
}
