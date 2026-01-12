import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const openrouter = createOpenRouter({
    apiKey: process.env.AI_OPEN_ROUTER_KEY,
})