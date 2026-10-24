import { ServerTestHarness } from './ServerTestHarness';
import type { IServerTestOptions } from './ServerTestHarness';

/**
 * Handle a spec body receives from {@link serverIntegration}, giving access to the harness built for
 * the current spec. Named `contextRef` to mirror the card-test harness's `integration()` ergonomics.
 */
export interface IServerIntegrationContextRef {
    harness: ServerTestHarness;
}

/**
 * Mirrors the card suite's `integration()` helper for gamenode specs: builds a fresh
 * {@link ServerTestHarness} before each spec and releases it afterwards, handing the running harness
 * to the spec body via `contextRef`.
 *
 * ```ts
 * describe('Lobby chat', function () {
 *     serverIntegration(function (contextRef) {
 *         it('sends a chat message', async function () {
 *             const { harness } = contextRef;
 *             ...
 *         });
 *     });
 * });
 * ```
 *
 * `options` is what each harness in the block is built with, e.g. `{ config: { allowAnonymousChat: true } }`
 * or `{ database: true }`; see {@link IServerTestOptions}.
 */
export function serverIntegration(
    definitions: (contextRef: IServerIntegrationContextRef) => void,
    options?: IServerTestOptions
): void {
    describe('- server integration -', function () {
        const contextRef: IServerIntegrationContextRef = { harness: null };

        beforeEach(async function () {
            contextRef.harness = await ServerTestHarness.createAsync(options);
        });

        afterEach(async function () {
            await contextRef.harness.shutdownAsync();
        });

        definitions(contextRef);
    });
}
