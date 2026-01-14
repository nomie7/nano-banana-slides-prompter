import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Sanitize text input to prevent XSS in prompt generation
const sanitizeText = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/[\r\n]+/g, ' ') // Replace newlines with space
    .trim()
    .slice(0, 100); // Limit length
};

// Validate and normalize hex color
const sanitizeColor = (color: string): string => {
  const hexPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  if (hexPattern.test(color)) {
    return color.toLowerCase();
  }
  return '#3b82f6'; // Return default if invalid
};

// Validate logo URL - only allow data:image/ prefix or empty
const sanitizeLogoUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('data:image/')) return url;
  return ''; // Reject non-data-image URLs
};

export interface BrandKit {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  logoUrl: string;
  companyName: string;
}

const DEFAULT_BRAND_KIT: BrandKit = {
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  fontFamily: 'Inter',
  fontSize: 'medium',
  logoUrl: '',
  companyName: '',
};

interface BrandKitStore {
  brandKit: BrandKit;
  isEnabled: boolean;

  updateBrandKit: (updates: Partial<BrandKit>) => void;
  setEnabled: (enabled: boolean) => void;
  resetToDefaults: () => void;
  getBrandPromptText: () => string;
}

export const useBrandKitStore = create<BrandKitStore>()(
  persist(
    (set, get) => ({
      brandKit: DEFAULT_BRAND_KIT,
      isEnabled: false,

      updateBrandKit: (updates) => {
        const sanitizedUpdates: Partial<BrandKit> = {};

        if (updates.companyName !== undefined) {
          sanitizedUpdates.companyName = sanitizeText(updates.companyName);
        }
        if (updates.primaryColor !== undefined) {
          sanitizedUpdates.primaryColor = sanitizeColor(updates.primaryColor);
        }
        if (updates.secondaryColor !== undefined) {
          sanitizedUpdates.secondaryColor = sanitizeColor(updates.secondaryColor);
        }
        if (updates.fontFamily !== undefined) {
          // Only allow whitelisted fonts
          sanitizedUpdates.fontFamily = FONT_FAMILIES.includes(updates.fontFamily)
            ? updates.fontFamily
            : 'Inter';
        }
        if (updates.fontSize !== undefined) {
          sanitizedUpdates.fontSize = updates.fontSize;
        }
        if (updates.logoUrl !== undefined) {
          sanitizedUpdates.logoUrl = sanitizeLogoUrl(updates.logoUrl);
        }

        set((state) => ({
          brandKit: { ...state.brandKit, ...sanitizedUpdates },
        }));
      },

      setEnabled: (enabled) => {
        set({ isEnabled: enabled });
      },

      resetToDefaults: () => {
        set({ brandKit: DEFAULT_BRAND_KIT, isEnabled: false });
      },

      getBrandPromptText: () => {
        const { brandKit, isEnabled } = get();
        if (!isEnabled) return '';

        const parts: string[] = [];

        if (brandKit.companyName) {
          parts.push(`Company: ${brandKit.companyName}`);
        }

        if (brandKit.primaryColor && brandKit.secondaryColor) {
          parts.push(
            `Brand colors: primary ${brandKit.primaryColor}, secondary ${brandKit.secondaryColor}`
          );
        }

        if (brandKit.fontFamily) {
          parts.push(`Font: ${brandKit.fontFamily}`);
        }

        if (parts.length === 0) return '';

        return `\n\nBrand Guidelines:\n${parts.join('\n')}`;
      },
    }),
    {
      name: 'nano-banana-brand-kit',
      version: 1,
    }
  )
);

export const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Poppins',
  'Lato',
  'Source Sans Pro',
  'Nunito',
  'Raleway',
  'Work Sans',
];

export const FONT_SIZES = [
  { value: 'small' as const, label: 'Small' },
  { value: 'medium' as const, label: 'Medium' },
  { value: 'large' as const, label: 'Large' },
];
