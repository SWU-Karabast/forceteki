describe('Contracted Hunter', function() {
    integration(function(contextRef) {
        it('Contracted Hunter\'s ability should be defeat on start of regroup phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['contracted-hunter', 'second-chance']
                },
                player2: {
                    leader: 'iden-versio#inferno-squad-commander',
                    base: { card: 'dagobah-swamp', damage: 5 }
                }
            });

            const { context } = contextRef;

            // play contracted hunter
            context.player1.clickCard(context.contractedHunter);

            // he dies on start of regroup phase
            context.moveToRegroupPhase();

            expect(context.contractedHunter).toBeInZone('discard');
            expect(context.getChatLog()).toBe('player1 uses Contracted Hunter to defeat Contracted Hunter');
            expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');

            // move to action phase
            context.player1.clickDone();
            context.player2.clickDone();

            // second chance ability is expired, can't play it from discard
            expect(context.contractedHunter).not.toHaveAvailableActionWhenClickedBy(context.player1);
            context.player1.passAction();

            // iden versio does not work because contracted hunter was not defeated this phase
            context.player2.clickCard(context.idenVersio);
            context.player2.clickPrompt('(No effect) Heal 1 from base if an opponent\'s unit was defeated this phase');
            context.player2.clickPrompt('Use it anyway');

            expect(context.p2Base.damage).toBe(5);
        });

        it('Contracted Hunter\'s ability should be defeat on start of regroup phase (Iden ability should trigger on regroup phase)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['contracted-hunter']
                },
                player2: {
                    leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                    base: { card: 'dagobah-swamp', damage: 5 }
                }
            });

            const { context } = contextRef;

            // contracted hunter dies on start of regroup phase
            context.moveToRegroupPhase();

            expect(context.contractedHunter).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(4);
        });

        it('Contracted Hunter\'s ability should not defeated when his ability is nullify for the round', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                    groundArena: ['contracted-hunter'],
                    resources: 3,
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kazudaXiono);
            context.player1.clickCard(context.contractedHunter);

            context.moveToNextActionPhase();

            expect(context.contractedHunter).toBeInZone('groundArena');
        });

        it('Contracted Hunter\'s ability should be defeated when his ability is nullify for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['contracted-hunter'],
                },
                player2: {
                    hand: ['force-lightning'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.forceLightning);
            context.player2.clickCard(context.contractedHunter);

            context.moveToNextActionPhase();

            expect(context.contractedHunter).toBeInZone('discard');
        });
    });
});
