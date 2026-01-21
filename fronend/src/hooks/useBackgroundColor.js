import { useState } from 'react';

export const useBackgroundColor = () => {
  const [backgroundStyle, setBackgroundStyle] = useState({
    background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5, #f0fdfa)'
  });

  const updateBackgroundColor = (color) => {
    if (color) {
      // Convert hex color to RGB for gradient
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Create gradient with the product color
      const lightColor = `rgba(${r}, ${g}, ${b}, 0.15)`;
      const mediumColor = `rgba(${r}, ${g}, ${b}, 0.08)`;
      const veryLightColor = `rgba(${r}, ${g}, ${b}, 0.03)`;
      
      setBackgroundStyle({
        background: `linear-gradient(135deg, ${lightColor}, ${mediumColor}, ${veryLightColor})`
      });
    } else {
      resetBackgroundColor();
    }
  };

  const resetBackgroundColor = () => {
    setBackgroundStyle({
      background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5, #f0fdfa)'
    });
  };

  return {
    backgroundStyle,
    updateBackgroundColor,
    resetBackgroundColor
  };
};