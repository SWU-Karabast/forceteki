describe('Play unit from hand', function() {
    integration(function(contextRef) {
        describe('When a unit is played', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cartel-spacer', 'first-legion-snowtrooper', 'battlefield-marine'],
                        resources: 6,
                        leader: 'boba-fett#collecting-the-bounty',
                        base: 'jabbas-palace'
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('it should land in the correct arena exausted and resources should be exhausted', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toBeInZone('spaceArena');
                expect(context.cartelSpacer.exhausted).toBe(true);
                expect(context.player1.readyResourceCount).toBe(4);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('it should cost 2 extra resources for one aspect penalty', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.firstLegionSnowtrooper);

                expect(context.firstLegionSnowtrooper).toBeInZone('groundArena');
                expect(context.firstLegionSnowtrooper.exhausted).toBe(true);
                expect(context.player1.readyResourceCount).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('it should cost 4 extra resources for two aspect penalties', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });
        });
    });
});
