import { useContext } from 'react';
import { BrandingContext } from '../providers/BrandingProvider';

export default function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return ctx;
}
