export type Tier = 'explorer' | 'adventurer' | 'collector';
export type BillingCycle = 'quarterly' | 'annual';

export const planGroups = [
  { tier: 'explorer' as Tier, name: 'Explorer Edition', size: '8x10', quarterly: '$49', annual: '$176', description: 'The easiest way to start collecting exclusive BANGERS prints.' },
  { tier: 'adventurer' as Tier, name: 'Adventurer Edition', size: '14x18', quarterly: '$69', annual: '$248', description: 'The balanced premium size for collectors who want a real statement piece.' },
  { tier: 'collector' as Tier, name: 'Collector Edition', size: '20x24', quarterly: '$89', annual: '$320', description: 'The largest launch tier for a true wall-art collector experience.' }
];

export const plans = [
  { tier: 'explorer', name: 'Explorer Edition', size: '8x10', billing: 'quarterly', amount: '$49', priceEnv: 'STRIPE_PRICE_EXPLORER_QUARTERLY' },
  { tier: 'explorer', name: 'Explorer Edition', size: '8x10', billing: 'annual', amount: '$176', priceEnv: 'STRIPE_PRICE_EXPLORER_ANNUAL' },
  { tier: 'adventurer', name: 'Adventurer Edition', size: '14x18', billing: 'quarterly', amount: '$69', priceEnv: 'STRIPE_PRICE_ADVENTURER_QUARTERLY' },
  { tier: 'adventurer', name: 'Adventurer Edition', size: '14x18', billing: 'annual', amount: '$248', priceEnv: 'STRIPE_PRICE_ADVENTURER_ANNUAL' },
  { tier: 'collector', name: 'Collector Edition', size: '20x24', billing: 'quarterly', amount: '$89', priceEnv: 'STRIPE_PRICE_COLLECTOR_QUARTERLY' },
  { tier: 'collector', name: 'Collector Edition', size: '20x24', billing: 'annual', amount: '$320', priceEnv: 'STRIPE_PRICE_COLLECTOR_ANNUAL' }
] as const;
