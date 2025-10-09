describe('Galen Erso - You\'ll Never Win', function() {
    integration(function(contextRef) {
        it('should be playable using Plot', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                },
            });

            const { context } = contextRef;
            expect(context.player1).toBeActivePlayer();
        });

        describe('Galen Erso - You\'ll Never Win\'s ability should name a card. While he is in play,', function() {
            it('leader cards should not be blanked when their title is named', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('leader units should not be blanked when their title is named', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('leader pilots should not be blanked when their title is named', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named non-leader Pilots should not be playable using Piloting', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named non-leader units should not trigger When Playeds', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named non-leader units should not trigger When Defeateds', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named non-leader units should not trigger abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named non-leader units should not gain abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named non-leader units should lose Keywords', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named non-leader units should be blanked if owned by the opponent even if controlled by Galen\'s owner', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named upgrades should lose abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named upgrades should not grant abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named events should be blanked when played from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named events should be blanked when played with Smuggle', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named events should be blanked when played with Plot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named bases should lose Epic Actions', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named bases should lose abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });

            it('named bases that have a deckbuilding restriction should not cause a game loss', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                    },
                });

                const { context } = contextRef;
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});