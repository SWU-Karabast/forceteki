describe('Relentless, Konstantine\'s Folly', function() {
    integration(function(contextRef) {
        describe('Relentless, Konstantine\'s Folly\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['relentless#konstantines-folly', 'daring-raid'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        hand: ['vanquish', 'repair', 'moment-of-peace', 'scout-bike-pursuer', 'bamboozle', 'crafty-smuggler'],
                        base: { card: 'dagobah-swamp', damage: 5 },
                        groundArena: ['tech#source-of-insight'],
                        resources: ['timely-intervention', 'confiscate', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                    },
                });
            });

            it('should nullify the effects of the first event the opponent plays each round', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.relentless);

                // play an event, with no effect
                let exhaustedResourcesBeforeCardPlay = context.player2.exhaustedResourceCount;
                context.player2.clickCard(context.vanquish);
                context.player2.clickPrompt('Play anyway');
                expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourcesBeforeCardPlay + 5);
                expect(context.relentless).toBeInZone('spaceArena');
                expect(context.vanquish).toBeInZone('discard');
                expect(context.getChatLogs(1)).toContain('player2 plays Vanquish to do nothing due to an ongoing effect of Relentless');

                context.player1.passAction();

                // play a second event, with effect
                exhaustedResourcesBeforeCardPlay = context.player2.exhaustedResourceCount;
                context.player2.clickCard(context.repair);
                context.player2.clickCard(context.p2Base);
                expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourcesBeforeCardPlay + 1);
                expect(context.p2Base.damage).toBe(2);

                // next round, it should nullify the first event played again
                context.moveToNextActionPhase();
                context.player1.passAction();
                exhaustedResourcesBeforeCardPlay = context.player2.exhaustedResourceCount;
                context.player2.clickCard(context.momentOfPeace);
                context.player2.clickPrompt('Play anyway');
                expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourcesBeforeCardPlay + 1);
                expect(context.relentless).toHaveExactUpgradeNames([]);
            });

            it('should not nullify a second or later event even if Relentless was played after the first event', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.repair);
                context.player2.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                context.player1.clickCard(context.relentless);

                expect(context.relentless).toBeInZone('spaceArena');
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.relentless);
                expect(context.relentless).toBeInZone('discard');
            });

            it('should not nullify an event played by its controller', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.relentless);

                context.player2.passAction();

                context.player1.clickCard(context.daringRaid);
                expect(context.p2Base.damage).toBe(5);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(7);
            });

            it('should nullify events played with smuggle after the cost is paid', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.relentless);

                expect(context.player2).toBeAbleToSelect(context.timelyIntervention);

                let exhaustedResourcesBeforeCardPlay = context.player2.exhaustedResourceCount;
                context.player2.clickCard(context.timelyIntervention);
                context.player2.clickPrompt('Play anyway');

                expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourcesBeforeCardPlay + 4);
                expect(context.timelyIntervention).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();

                context.moveToNextActionPhase();

                context.player1.passAction();

                expect(context.player2).toBeAbleToSelect(context.confiscate);

                exhaustedResourcesBeforeCardPlay = context.player2.exhaustedResourceCount;
                context.player2.clickCard(context.confiscate);
                context.player2.clickPrompt('Play anyway');

                expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourcesBeforeCardPlay + 3);
                expect(context.timelyIntervention).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();
            });

            it('should allow to play Bamboozle for free but nullify the effect', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.relentless);

                context.player2.clickCard(context.bamboozle);
                context.player2.clickPrompt('Play Bamboozle by discarding a Cunning card');
                context.player2.clickPrompt('Play anyway');
                context.player2.clickCard(context.craftySmuggler);

                expect(context.bamboozle).toBeInZone('discard');
                expect(context.craftySmuggler).toBeInZone('discard');
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
