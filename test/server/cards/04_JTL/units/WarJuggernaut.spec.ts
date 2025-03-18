
describe('War Juggernaut', function() {
    integration(function(contextRef) {
        it('War Juggernaut\'s constant ability should get +1/0 for each damaged unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'war-juggernaut', damage: 4 }, 'pyke-sentinel'],
                    spaceArena: [{ card: 'inferno-four#unforgetting', damage: 2 }]
                },
                player2: {
                    groundArena: ['first-legion-snowtrooper', { card: 'maul#shadow-collective-visionary', damage: 3 }],
                    spaceArena: [{ card: 'imperial-interceptor', damage: 1 }, 'ruthless-raider']
                }
            });

            const { context } = contextRef;

            // War Juggernaut should have 7 power (3 from card and 4 from damaged units)
            expect(context.warJuggernaut.getPower()).toBe(7);

            context.player1.clickCard(context.pykeSentinel);
            context.player1.clickCard(context.firstLegionSnowtrooper);

            // War Juggernaut should have 9 power (3 from card and 6 from damaged units)
            expect(context.warJuggernaut.getPower()).toBe(9);
        });

        it('War Juggernaut\'s constant ability should not get +1/0 because there are no damaged units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['war-juggernaut', 'pyke-sentinel'],
                    spaceArena: ['inferno-four#unforgetting']
                },
                player2: {
                    groundArena: ['first-legion-snowtrooper', 'maul#shadow-collective-visionary'],
                    spaceArena: ['imperial-interceptor', 'ruthless-raider']
                }
            });

            const { context } = contextRef;

            // War Juggernaut should have 3 power (3 from card and 0 from damaged units)
            expect(context.warJuggernaut.getPower()).toBe(3);

            context.player1.clickCard(context.pykeSentinel);
            context.player1.clickCard(context.firstLegionSnowtrooper);

            // War Juggernaut should have 5 power (3 from card and 2 from damaged units)
            expect(context.warJuggernaut.getPower()).toBe(5);
        });

        describe('War Juggernaut\'s when played ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['war-juggernaut'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: [{ card: 'inferno-four#unforgetting', damage: 2 }]
                    },
                    player2: {
                        groundArena: ['first-legion-snowtrooper', 'maul#shadow-collective-visionary'],
                        spaceArena: ['imperial-interceptor', { card: 'ruthless-raider', damage: 2 }]
                    }
                });
            });

            it('should deal 1 damage to each of any number of units', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.warJuggernaut);

                // War Juggernaut should have 5 power (3 from card and 2 from damaged units)
                expect(context.warJuggernaut.getPower()).toBe(5);
                expect(context.warJuggernaut.getHp()).toBe(7);
                expect(context.warJuggernaut.damage).toBe(0);

                expect(context.player1).toHavePrompt('Choose units to deal 1 damage to.');
                expect(context.player1).toHaveChooseNoTargetButton();
                expect(context.player1).toBeAbleToSelectExactly([
                    context.warJuggernaut,
                    context.pykeSentinel,
                    context.infernoFourUnforgetting,
                    context.firstLegionSnowtrooper,
                    context.maulShadowCollectiveVisionary,
                    context.imperialInterceptor,
                    context.ruthlessRaider
                ]);

                context.player1.clickCard(context.warJuggernaut);
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickCard(context.firstLegionSnowtrooper);
                context.player1.clickCard(context.maulShadowCollectiveVisionary);
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickPrompt('Done');

                // War Juggernaut should have 9 power (3 from card and 6 from damaged units)
                expect(context.warJuggernaut.getPower()).toBe(9);
                expect(context.warJuggernaut.getHp()).toBe(7);
                expect(context.warJuggernaut.damage).toBe(1);
                expect(context.pykeSentinel.damage).toBe(1);
                expect(context.firstLegionSnowtrooper.damage).toBe(1);
                expect(context.maulShadowCollectiveVisionary.damage).toBe(1);
                expect(context.ruthlessRaider.damage).toBe(3);
            });

            it('should choose no targets to deal damage', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.warJuggernaut);

                // War Juggernaut should have 5 power (3 from card and 2 from damaged units)
                expect(context.warJuggernaut.getPower()).toBe(5);
                expect(context.warJuggernaut.getHp()).toBe(7);
                expect(context.warJuggernaut.damage).toBe(0);

                expect(context.player1).toHavePrompt('Choose units to deal 1 damage to.');
                expect(context.player1).toHaveChooseNoTargetButton();
                expect(context.player1).toBeAbleToSelectExactly([
                    context.warJuggernaut,
                    context.pykeSentinel,
                    context.infernoFourUnforgetting,
                    context.firstLegionSnowtrooper,
                    context.maulShadowCollectiveVisionary,
                    context.imperialInterceptor,
                    context.ruthlessRaider
                ]);

                context.player1.clickPrompt('Choose no target');

                // War Juggernaut should have 5 power (3 from card and 2 from damaged units)
                expect(context.warJuggernaut.getPower()).toBe(5);
                expect(context.warJuggernaut.getHp()).toBe(7);
                expect(context.warJuggernaut.damage).toBe(0);
            });
        });
    });
});