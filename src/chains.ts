import { Chain, baseSepolia } from '@wagmi/core/chains';

export const supportedChains: { [key: number]: Chain } = { [baseSepolia.id]: baseSepolia };
