describe('Play unit from hand', function() {
    integration(function(contextRef) {
        describe('When a unit is played', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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

        describe('When a unit in hand has aspect penalties', function() {
            it('should include the specific missing aspects in the active player summary', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            // villainy, cunning
                            'cartel-spacer',
                            // double cunning
                            'zuckuss#the-findsman',
                            // heroism
                            'alliance-xwing',
                            // heroism, command
                            'battlefield-marine'
                        ],
                        // villainy, cunning
                        leader: 'boba-fett#collecting-the-bounty',
                        // aggression
                        base: 'kestro-city'
                    }
                });

                const { context } = contextRef;

                expect(context.cartelSpacer.getSummary(context.player1Object).aspectPenaltyAspects).toBeUndefined();
                expect(context.zuckuss.getSummary(context.player1Object).aspectPenaltyAspects).toEqual(['cunning']);
                expect(context.allianceXwing.getSummary(context.player1Object).aspectPenaltyAspects).toEqual(['heroism']);
                expect(context.battlefieldMarine.getSummary(context.player1Object).aspectPenaltyAspects).toEqual(['command', 'heroism']);
            });
        });
    });
});
