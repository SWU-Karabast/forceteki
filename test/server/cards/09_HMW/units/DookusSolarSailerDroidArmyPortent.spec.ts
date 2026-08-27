describe('Dooku\'s Solar Sailer, Droid Army Portent', function() {
    integration(function(contextRef) {
        it('Dooku\'s Solar Sailer\'s ability should make each opponent discard a card from their hand if you control a unit that costs 1 or less', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dookus-solar-sailer#droid-army-portent', 'gungi#finding-himself'],
                    groundArena: ['curious-flock'],
                },
                player2: {
                    hand: ['wampa', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dookusSolarSailer);

            expect(context.player2).toHavePrompt('Choose a card to discard for Dooku\'s Solar Sailer\'s effect');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst]);
            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard');
        });

        it('Dooku\'s Solar Sailer\'s ability should make each opponent discard a card from their hand if you control a unit that costs 1 or less (created unit on the same trigger window (TWI Poggle))', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dookus-solar-sailer#droid-army-portent'],
                    groundArena: ['poggle-the-lesser#archduke-of-the-stalgasin-hive'],
                },
                player2: {
                    hand: ['wampa', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dookusSolarSailer);

            expect(context.player1).toHaveEnabledPromptButtons([
                'Exhaust this unit to create a Battle Droid token',
                '(No effect) Each opponent discards a card from their hand'
            ]);

            context.player1.clickPrompt('Exhaust this unit to create a Battle Droid token');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toHavePrompt('Choose a card to discard for Dooku\'s Solar Sailer\'s effect');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst]);
            context.player2.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard');
        });

        it('Dooku\'s Solar Sailer\'s ability should not discard a card if you do not control a unit that costs 1 or less', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dookus-solar-sailer#droid-army-portent'],
                    groundArena: ['wampa'],
                },
                player2: {
                    hand: ['atst'],
                    groundArena: ['porg']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dookusSolarSailer);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toBeInZone('hand');
        });
    });
});
