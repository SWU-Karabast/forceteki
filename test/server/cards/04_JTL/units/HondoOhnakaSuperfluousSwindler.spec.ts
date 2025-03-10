describe('Hondo Ohnaka, Superfluous Swindler', function() {
    integration(function(contextRef) {
        it('Hondo Ohnaka\'s ability takes control of an non-pilot upgrade and attach it to a different unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['independent-smuggler'],
                    groundArena: [
                        { card: 'atst', upgrades: ['smuggling-compartment'] },
                        { card: 'wampa', upgrades: ['shield'] }
                    ],
                    spaceArena: ['phoenix-squadron-awing']
                },
                player2: {
                    groundArena: ['hondo-ohnaka#superfluous-swindler', 'frontier-atrt'],
                    leader: 'finn#this-is-a-rescue',
                    resources: 4
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.independentSmuggler);
            context.player1.clickPrompt('Play Independent Smuggler with Piloting');
            context.player1.clickCard(context.atst);

            context.player2.clickCard(context.hondoOhnaka);
            context.player2.clickCard(context.p1Base);
            expect(context.player2).toBeAbleToSelectExactly([context.smugglingCompartment, context.shield]);
            context.player2.clickCard(context.smugglingCompartment);
            expect(context.player2).toBeAbleToSelectExactly([context.phoenixSquadronAwing, context.frontierAtrt]);
            context.player2.clickCard(context.frontierAtrt);

            expect(context.frontierAtrt).toHaveExactUpgradeNames(['smuggling-compartment']);

            context.player1.passAction();

            // assert we have control of upgrade with finn ability which target only upgrade we control
            context.player2.clickCard(context.finn);
            expect(context.player2).toBeAbleToSelectExactly([context.smugglingCompartment]);
            context.player2.clickCard(context.smugglingCompartment);

            expect(context.player1).toBeActivePlayer();
            expect(context.frontierAtrt).toHaveExactUpgradeNames(['shield']);
        });

        // TODO ADD A TEST TO TRANSFER UPGRADE BETWEEN ZONE WHEN #776 (moving an upgrade between zone) IS FIXED
    });
});