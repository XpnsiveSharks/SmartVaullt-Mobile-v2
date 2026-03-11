# Assets Directory

This directory contains images and other static assets for the SmartVault app.

## Usage

To use images in your components:

```tsx
import logoImage from '../../assets/images/logo.png';

<Image 
  source={logoImage} 
  style={{ width: 80, height: 80 }}
  resizeMode="contain"
/>
```

## Supported Formats

- PNG (recommended for logos)
- JPG/JPEG
- SVG (for scalable graphics)

## Adding New Images

1. Place your image files in this directory
2. Import them in your components using relative paths
3. Use the `Image` component from React Native with appropriate styling