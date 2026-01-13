import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
        set((state) => ({
          brandKit: { ...state.brandKit, ...updates },
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
