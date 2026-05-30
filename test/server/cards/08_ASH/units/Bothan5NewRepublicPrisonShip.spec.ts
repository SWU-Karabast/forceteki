describe('Bothan-5, New Republic Prison Ship', function() {
    integration(function(contextRef) {
        it('Bothan-5\'s ability should capture a defeated friendly non-vehicle unit from discard (only 1 time per round)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'battlefield-marine', 'gungi#finding-himself'],
                    spaceArena: ['bothan5#new-republic-prison-ship']
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['atst'],
                    hand: ['takedown', 'rivals-fall'],
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.wampa);

            expect(context.player1).toHavePassAbilityPrompt('Bothan-5 captures Wampa from your discard pile');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa).toBeCapturedBy(context.bothan5);

            context.player1.passAction();

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('discard');

            context.moveToNextActionPhase();

            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.gungi);

            expect(context.player1).toHavePassAbilityPrompt('Bothan-5 captures Gungi from your discard pile');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeActivePlayer();
            expect(context.gungi).toBeCapturedBy(context.bothan5);
        });

        it('Bothan-5\'s ability should not capture a defeated friendly Vehicle unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['atst'],
                    spaceArena: ['bothan5#new-republic-prison-ship']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['rivals-fall'],
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.atst);

            expect(context.player1).toBeActivePlayer();
            expect(context.atst).toBeInZone('discard');
        });

        it('Bothan-5\'s ability should not capture a defeated enemy non-vehicle unit from discard', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall'],
                    spaceArena: ['bothan5#new-republic-prison-ship']
                },
                player2: {
                    groundArena: ['wampa'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard');
        });

        it('Bothan-5\'s ability should not capture a bounced friendly non-vehicle unit from discard', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['bothan5#new-republic-prison-ship']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['waylay'],
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.wampa);

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa).toBeInZone('hand');
        });

        it('Bothan-5\'s ability should not capture a defeated friendly piloting unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chewbacca#faithful-first-mate'],
                    spaceArena: ['bothan5#new-republic-prison-ship', 'awing']
                },
                player2: {
                    hand: ['outer-rim-constable'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chewbacca);
            context.player1.clickPrompt('Play Chewbacca with Piloting');
            context.player1.clickCard(context.awing);

            context.player2.clickCard(context.outerRimConstable);
            context.player2.clickCard(context.chewbacca);

            expect(context.player1).toBeActivePlayer();
            expect(context.chewbacca).toBeInZone('discard');
        });

        it('Bothan-5\'s ability should not capture a defeated friendly unit which had move from discard before trigger', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['superlaser-technician'],
                    spaceArena: ['bothan5#new-republic-prison-ship']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['takedown'],
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.superlaserTechnician);

            expect(context.player1).toHaveExactPromptButtons([
                'Put Superlaser Technician into play as a resource and ready it',
                'Bothan-5 captures Superlaser Technician from your discard pile'
            ]);

            context.player1.clickPrompt('Put Superlaser Technician into play as a resource and ready it');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeActivePlayer();
            expect(context.superlaserTechnician).toBeInZone('resource');
        });
    });
});
