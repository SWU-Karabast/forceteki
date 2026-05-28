describe('Moff Gideon, Indomitable Warlord', function () {
    integration(function (contextRef) {
        describe('leader side ability', function () {
            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['warzone-lieutenant'],
                        leader: 'moff-gideon#indomitable-warlord',
                        resources: 4,
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.moffGideon);
                expect(context.player1).toHavePrompt('The ability "Play a unit from your hand. It costs 1 resource less." will have no effect. Are you sure you want to use it?');
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.moffGideon.exhausted).toBeTrue();
            });

            it('should allow paying 1 resource to draw a card when claiming initiative', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['warzone-lieutenant', 'academy-training', 'clone-pilot', 'resupply'],
                        leader: 'moff-gideon#indomitable-warlord',
                        spaceArena: ['tie-advanced', 'awing'],
                        resources: 4,
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown']
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.tieAdvanced);

                context.player1.clickCard(context.moffGideon);

                expect(context.player1).toBeAbleToSelectExactly([context.warzoneLieutenant, context.clonePilot]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.clonePilot);

                expect(context.player2).toBeActivePlayer();
                expect(context.moffGideon.exhausted).toBeTrue();
                expect(context.clonePilot).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        // describe('leader unit side ability', function () {
        // });
    });
});
