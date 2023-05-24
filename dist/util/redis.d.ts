/**
 * Check whether the maxmemory-policy config is set to noeviction
 *
 * BullMQ requires this setting in redis
 * For details, see: https://docs.bullmq.io/guide/connections
 */
export declare const isMaxmemoryPolicyNoeviction: () => Promise<boolean>;
