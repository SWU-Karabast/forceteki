describe('Villainous Ambition', function() {
    integration(function(contextRef) {
        it('Villainous Ambition\'s ability should deal 2 damage to a unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['villainous-ambition'],
                    groundArena: ['wampa', 'pyke-sentinel'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.villainousAmbition);
            context.player1.clickCard(context.pykeSentinel);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.pykeSentinel, context.cartelSpacer]);

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(2);
        });
        it('Villainous Ambition\'s ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['villainous-ambition'],
                    groundArena: ['wampa', 'pyke-sentinel'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.villainousAmbition);
            context.player1.clickCard(context.pykeSentinel);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(0);
        });

        it('Villainous Ambition\'s ability should not trigger if played on a non villain', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['villainous-ambition'],
                    groundArena: ['wampa', 'pyke-sentinel'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.villainousAmbition);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
        });
    });
});