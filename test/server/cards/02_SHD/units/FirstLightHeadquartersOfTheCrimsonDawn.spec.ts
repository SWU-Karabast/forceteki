describe('First Light, Headquarters of the Crimson Dawn', function() {
    integration(function(contextRef) {
        describe('First Light\'s', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'qira#i-alone-survived',
                        groundArena: ['wampa'],
                        spaceArena: [{ card: 'tie-advanced', damage: 1, upgrades: ['shield'] }],
                        resources: ['first-light#headquarters-of-the-crimson-dawn', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                    },
                    player2: {
                        spaceArena: ['cartel-spacer'],
                        hand: ['waylay']
                    }
                });
            });

            it('Smuggle ability should require dealing 4 damage to a friendly unit as a cost, and its constant ability give grit to all friendly units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.firstLight);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tieAdvanced]);
                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.firstLight).toBeInZone('spaceArena');

                // check damage and grit
                expect(context.wampa.damage).toBe(4);
                expect(context.wampa.getPower()).toBe(8);
                expect(context.tieAdvanced.damage).toBe(1);
                expect(context.tieAdvanced.getPower()).toBe(4);

                // waylay First Light back to hand so we can play from hand and confirm the ability doesn't trigger
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.firstLight);

                context.player1.readyResources(7);
                context.player1.clickCard(context.firstLight);
                expect(context.firstLight).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(7);
            });

            it('Smuggle ability should still work if a shield prevents the friendly unit damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.firstLight);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tieAdvanced]);
                context.player1.clickCard(context.tieAdvanced);

                expect(context.firstLight).toBeInZone('spaceArena');
                expect(context.tieAdvanced.damage).toBe(1);
                expect(context.tieAdvanced.isUpgraded()).toBeFalse();
            });
        });

        it('First Light\'s Smuggle ability cannot trigger if there are no friendly units', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    leader: 'qira#i-alone-survived',
                    resources: ['first-light#headquarters-of-the-crimson-dawn', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                },
                player2: {
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCardNonChecking(context.firstLight);
            expect(context.firstLight).toBeInZone('resource');
            expect(context.player1).toBeActivePlayer();
        });

        it('First Light\'s Smuggle ability uses the correct cost aspects', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    leader: 'jyn-erso#resisting-oppression',
                    base: 'echo-base',
                    groundArena: ['wampa'],
                    // 11 total resources
                    resources: [
                        'first-light#headquarters-of-the-crimson-dawn', 'atst', 'atst', 'atst',
                        'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'
                    ],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.firstLight);
            expect(context.player1).toBeAbleToSelectExactly(context.wampa);
            context.player1.clickCard(context.wampa);

            expect(context.firstLight).toBeInZone('spaceArena');
            expect(context.wampa.damage).toBe(4);
            expect(context.player1.exhaustedResourceCount).toBe(11);
        });

        it('First Light\'s Smuggle ability will appear as an alternative to a gained Smuggle ability', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    leader: 'qira#i-alone-survived',
                    groundArena: ['tech#source-of-insight'],
                    resources: ['first-light#headquarters-of-the-crimson-dawn', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                },
                player2: {
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.firstLight);
            expect(context.player1).toHaveExactPromptButtons([
                'Play First Light with Smuggle by dealing 4 damage to a friendly unit',
                'Play First Light with Smuggle',
                'Cancel'
            ]);

            context.player1.clickPrompt('Play First Light with Smuggle');
            expect(context.firstLight).toBeInZone('spaceArena');
            expect(context.player1.exhaustedResourceCount).toBe(9);
        });
    });

    // TODO: test with tie phantom and confirm it can't be used to pay the damage cost
});
