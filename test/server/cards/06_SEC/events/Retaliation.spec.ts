describe('Retaliation', function() {
    integration(function(contextRef) {
        // it('Retaliation\'s ability should be able to defeat an enemy unit who attack base this phase', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['retaliation'],
        //         },
        //         player2: {
        //             groundArena: ['wampa', 'gamorrean-guards'],
        //             hasInitiative: true,
        //         }
        //     });
        //     const { context } = contextRef;
        //
        //     context.player2.clickCard(context.wampa);
        //     context.player2.clickCard(context.p1Base);
        //
        //     context.player1.clickCard(context.retaliation);
        //     expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
        //
        //     context.player1.clickCard(context.wampa);
        //     expect(context.wampa).toBeInZone('discard');
        //     expect(context.player2).toBeActivePlayer();
        // });
        //
        // it('Retaliation\'s ability should be able to defeat an enemy unit which deal overwhelm to a base this phase', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['retaliation'],
        //             groundArena: ['battlefield-marine']
        //         },
        //         player2: {
        //             groundArena: ['wampa'],
        //             hasInitiative: true,
        //         }
        //     });
        //     const { context } = contextRef;
        //
        //     context.player2.clickCard(context.wampa);
        //     context.player2.clickCard(context.battlefieldMarine);
        //
        //     context.player1.clickCard(context.retaliation);
        //     expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
        //     context.player1.clickCard(context.wampa);
        //
        //     expect(context.wampa).toBeInZone('discard');
        //     expect(context.player2).toBeActivePlayer();
        // });
        //
        // it('Retaliation\'s ability should be able to defeat an enemy unit which deal ability damage with an upgrade to a base this phase', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['retaliation'],
        //             groundArena: ['battlefield-marine']
        //         },
        //         player2: {
        //             groundArena: [{ card: 'cassian-andor#threading-the-eye', upgrades: ['ruthlessness'] }],
        //             hasInitiative: true,
        //         }
        //     });
        //     const { context } = contextRef;
        //
        //     context.player2.clickCard(context.cassianAndor);
        //     context.player2.clickCard(context.battlefieldMarine);
        //
        //     context.player1.clickCard(context.retaliation);
        //     expect(context.player1).toBeAbleToSelectExactly([context.cassianAndor]);
        //
        //     context.player1.clickCard(context.cassianAndor);
        //     expect(context.cassianAndor).toBeInZone('discard');
        //     expect(context.player2).toBeActivePlayer();
        // });
        //
        // it('Retaliation\'s ability should be able to defeat an enemy unit which deal ability damage to a base this phase', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['retaliation'],
        //             groundArena: ['battlefield-marine']
        //         },
        //         player2: {
        //             leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
        //             hasInitiative: true,
        //         }
        //     });
        //     const { context } = contextRef;
        //
        //     context.player2.clickCard(context.sabineWren);
        //     context.player2.clickCard(context.battlefieldMarine);
        //
        //     context.player1.clickCard(context.retaliation);
        //     expect(context.player1).toBeAbleToSelectExactly([context.sabineWren]);
        //
        //     context.player1.clickCard(context.sabineWren);
        //     expect(context.sabineWren.deployed).toBeFalse();
        //     expect(context.player2).toBeActivePlayer();
        // });

        it('Retaliation\'s ability should not be able to defeat a leader unit which deal damage to a base while it is not deployed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['retaliation'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hand: ['general-hux#no-terms-no-surrender'],
                    leader: 'captain-phasma#chrome-dome',
                    hasInitiative: true,
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.generalHux);

            context.player1.passAction();
            context.player2.clickCard(context.captainPhasma);
            context.player2.clickPrompt('If you played a First Order card this phase, deal 1 damage to a base');
            context.player2.clickCard(context.p1Base);

            context.player1.passAction();
            context.player2.clickCard(context.captainPhasma);
            context.player2.clickPrompt('Deploy Captain Phasma');

            context.player1.passAction();
            context.player2.clickCard(context.captainPhasma);
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickPrompt('Pass');

            context.player1.clickCard(context.retaliation);
            expect(context.player1).toHaveExactPromptButtons(['Use it anyway', '']);

            context.player1.clickPrompt('Use it anyway');
            expect(context.sabineWren.deployed).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });
    });
});
