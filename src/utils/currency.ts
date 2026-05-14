/**
 * Currency Configuration
 * Supports environment override via VITE_CURRENCY_CODE
 */
const DEFAULT_CURRENCY = 'NGN';

const CURRENCY_CONFIG = {
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimals: 2 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
};

// Get currency from env or default to NGN
const currencyCode = (import.meta.env.VITE_CURRENCY as string) || DEFAULT_CURRENCY;
const currency = CURRENCY_CONFIG[currencyCode as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG[DEFAULT_CURRENCY];

/**
 * Formats a numeric amount as currency string
 * @param amount - The numeric amount
 * @param options - Formatting options
 * @returns Formatted currency string with symbol
 */
export const formatCurrency = (
  amount: number,
  options: { showSymbol?: boolean; decimals?: number } = {}
): string => {
  const { showSymbol = true, decimals = currency.decimals } = options;
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${currency.symbol}${formatted}` : formatted;
};

/**
 * Strips currency symbol from a price string and returns the numeric value
 * @param priceStr - Price string that may contain currency symbols
 * @returns Numeric value
 */
export const parseCurrency = (priceStr: string): number => {
  // Remove any non-numeric characters except decimal point and minus
  const cleaned = priceStr.replace(/[^0-9.-]+/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Gets the currency symbol
 * @returns Currency symbol string
 */
export const getCurrencySymbol = (): string => currency.symbol;

/**
 * Gets the currency code
 * @returns Currency code (e.g., 'NGN')
 */
export const getCurrencyCode = (): string => currency.code;

/**
 * Gets the currency configuration object
 * @returns Currency configuration
 */
export const getCurrencyConfig = () => currency;
