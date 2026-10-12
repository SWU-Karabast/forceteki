import { ServerTestHarness } from './ServerTestHarness';
import type { TestConfigOverrides } from './TestGameServer';

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
 */
export function serverIntegration(
    definitions: (contextRef: IServerIntegrationContextRef) => void,
    configOverrides?: TestConfigOverrides
): void {
    describe('- server integration -', function () {
        const contextRef: IServerIntegrationContextRef = { harness: null };

        beforeEach(async function () {
            contextRef.harness = await ServerTestHarness.createAsync(configOverrides);
        });

        afterEach(async function () {
            await contextRef.harness.shutdownAsync();
        });

        definitions(contextRef);
    });
}
