describe('Scorch, Imperial Commando', function() {
    integration(function(contextRef) {
        describe('Scorch\'s ability', function() {
            it('should deal 1 damage to an upgraded unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'scorch#imperial-commando', upgrades: ['experience'] }],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: [{ card: 'atst', upgrades: ['mastery'] }],
                        spaceArena: [{ card: 'mynock', upgrades: ['fulcrum'] }]
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.scorch);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.scorch, context.atst, context.mynock]);

                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(1);
            });

            it('should not treat a base with a Fortify upgrade attached as an upgraded unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'scorch#imperial-commando', upgrades: ['experience'] }]
                    },
                    player2: {
                        base: { card: 'echo-base', upgrades: ['alliance-shield-generator'] },
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.scorch);
                context.player1.clickCard(context.p2Base);

                // The enemy base has an upgrade attached via Fortify, but it is not a unit so it is not selectable
                expect(context.player1).toBeAbleToSelectExactly([context.scorch]);

                context.player1.clickCard(context.scorch);

                expect(context.player2).toBeActivePlayer();
                expect(context.scorch.damage).toBe(1);
            });
        });
    });
});
