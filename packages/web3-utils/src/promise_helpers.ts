/*
    Copyright 2023 All BEATOZ Developers

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

import { isNullish } from '@beatoz/web3-validator';

/**
 * An alternative to the node function `isPromise` that exists in `util/types` because it is not available on the browser.
 * @param object - to check if it is a `Promise`
 * @returns `true` if it is an `object` or a `function` that has a `then` function. And returns `false` otherwise.
 */
export function isPromise(object: unknown): boolean {
    return (
        (typeof object === 'object' || typeof object === 'function') &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        typeof (object as { then: unknown }).then === 'function'
    );
}

export type AsyncFunction<T, K = unknown> = (...args: K[]) => Promise<T>;

export function waitWithTimeout<T>(
    awaitable: Promise<T> | AsyncFunction<T>,
    timeout: number,
    error: Error,
): Promise<T>;
export function waitWithTimeout<T>(
    awaitable: Promise<T> | AsyncFunction<T>,
    timeout: number,
): Promise<T | undefined>;

/**
 * Wait for a promise but interrupt it if it did not resolve within a given timeout.
 * If the timeout reached, before the promise code resolve, either throw an error if an error object was provided, or return `undefined`.
 * @param awaitable - The promise or function to wait for.
 * @param timeout - The timeout in milliseconds.
 * @param error - (Optional) The error to throw if the timeout reached.
 */
export async function waitWithTimeout<T>(
    awaitable: Promise<T> | AsyncFunction<T>,
    timeout: number,
    error?: Error,
): Promise<T | undefined> {
    let timeoutId: NodeJS.Timeout | undefined;
    const result = await Promise.race([
        awaitable instanceof Promise ? awaitable : awaitable(),
        new Promise<undefined | Error>((resolve, reject) => {
            timeoutId = setTimeout(() => (error ? reject(error) : resolve(undefined)), timeout);
        }),
    ]);
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    if (result instanceof Error) {
        throw result;
    }
    return result;
}

/**
 * Repeatedly calls an async function with a given interval until the result of the function is defined (not undefined or null),
 * or until a timeout is reached.
 * @param func - The function to call.
 * @param interval - The interval in milliseconds.
 */
export async function pollTillDefined<T>(
    func: AsyncFunction<T>,
    interval: number,
): Promise<Exclude<T, undefined>> {
    const awaitableRes = waitWithTimeout(func, interval);

    let intervalId: NodeJS.Timeout | undefined;
    const polledRes = new Promise<Exclude<T, undefined>>((resolve, reject) => {
        intervalId = setInterval(() => {
            (async () => {
                try {
                    const res = await waitWithTimeout(func, interval);

                    if (!isNullish(res)) {
                        clearInterval(intervalId);
                        resolve(res as unknown as Exclude<T, undefined>);
                    }
                } catch (error) {
                    clearInterval(intervalId);
                    reject(error);
                }
            })() as unknown;
        }, interval);
    });

    // If the first call to awaitableRes succeeded, return the result
    const res = await awaitableRes;
    if (!isNullish(res)) {
        if (intervalId) {
            clearInterval(intervalId);
        }
        return res as unknown as Exclude<T, undefined>;
    }

    return polledRes;
}

/**
 * Enforce a timeout on a promise, so that it can be rejected if it takes too long to complete
 * @param timeout - The timeout to enforced in milliseconds.
 * @param error - The error to throw if the timeout is reached.
 * @returns A tuple of the timeout id and the promise that will be rejected if the timeout is reached.
 *
 * @example
 * ```ts
 * const [timerId, promise] = web3.utils.rejectIfTimeout(100, new Error('time out'));
 * ```
 */
export function rejectIfTimeout(timeout: number, error: Error): [NodeJS.Timer, Promise<never>] {
    let timeoutId: NodeJS.Timer | undefined;
    const rejectOnTimeout = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(error);
        }, timeout);
    });
    return [timeoutId as unknown as NodeJS.Timer, rejectOnTimeout];
}

/**
 * Sets an interval that repeatedly executes the given cond function with the specified interval between each call.
 * If the condition is met, the interval is cleared and a Promise that rejects with the returned value is returned.
 * @param cond - The function/confition to call.
 * @param interval - The interval in milliseconds.
 * @returns - an array with the interval ID and the Promise.
 */
export function rejectIfConditionAtInterval<T>(
    cond: AsyncFunction<T | undefined>,
    interval: number,
): [NodeJS.Timer, Promise<never>] {
    let intervalId: NodeJS.Timeout | undefined;
    const rejectIfCondition = new Promise<never>((_, reject) => {
        intervalId = setInterval(() => {
            (async () => {
                const error = await cond();
                if (error) {
                    clearInterval(intervalId);
                    reject(error);
                }
            })() as unknown;
        }, interval);
    });
    return [intervalId as unknown as NodeJS.Timer, rejectIfCondition];
}
