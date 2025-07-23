import IORedis from 'ioredis';

export const pub = new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
});
export const sub = new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
});