describe('Forced Surrender', function() {
    integration(function(contextRef) {
        describe('Forced Surrender\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['forced-surrender', 'atst', 'atst'],
                        groundArena: ['wampa'],
                        discard: ['daring-raid'],
                        leader: 'sabine-wren#galvanized-revolutionary'
                    },
                    player2: {
                        groundArena: ['maz-kanata#pirate-queen'],
                        hand: ['atst', 'atst']
                    }
                });
            });

            it('draws 2 cards and makes opponents whose base you damaged this phase discard 2 cards', function () {
                const { context } = contextRef;

                const reset = () => {
                    if (context.mazKanata.location === 'discard') {
                        context.player2.moveCard(context.mazKanata, 'ground arena');
                    }
                    context.player2.claimInitiative();

                    context.player1.hand.forEach((card) => context.player1.moveCard(card, 'deck'));
                    context.player2.hand.forEach((card) => context.player2.moveCard(card, 'deck'));
                    context.player1.moveCard(context.forcedSurrender, 'hand');
                    context.player1.passAction();

                    context.player2.clickPrompt('Done');
                    context.player1.clickPrompt('Done');
                };

                context.player1.passAction();

                // Scenario 1: Damage dealt with direct attack
                context.player2.clickCard(context.mazKanata);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.forcedSurrender);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(4);
                expect(context.player2.handSize).toBe(0);

                reset();

                // Scenario 2: No damage dealt this phase
                context.player2.clickCard(context.mazKanata);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.forcedSurrender);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(4);
                expect(context.player2.handSize).toBe(2);

                reset();

                // Scenario 3: Damage dealt with overwhelm
                context.player2.clickCard(context.mazKanata);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.mazKanata);

                context.player2.passAction();

                context.player1.clickCard(context.forcedSurrender);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(4);
                expect(context.player2.handSize).toBe(0);

                reset();

                // Scenario 4: Damage dealt with event
                context.player2.clickCard(context.mazKanata);
                context.player2.clickCard(context.p1Base);

                context.player1.moveCard(context.daringRaid, 'hand');
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.forcedSurrender);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(4);
                expect(context.player2.handSize).toBe(0);

                reset();

                // Scenario 5: Damage dealt with ability and to self
                context.player2.clickCard(context.mazKanata);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.sabineWren);
                context.player1.clickPrompt('Deal 1 damage to each base');

                context.player2.passAction();

                context.player1.clickCard(context.forcedSurrender);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(4);
                expect(context.player2.handSize).toBe(0);

                reset();

                // Scenario 6: Damage dealt with multiple sources
                context.player2.clickCard(context.mazKanata);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.sabineWren);
                context.player1.clickPrompt('Deal 1 damage to each base');

                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.mazKanata);

                context.player2.passAction();

                context.player1.moveCard(context.daringRaid, 'hand');
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                const p2BaseDamageBeforeForceSurrender = context.p2Base.damage;
                context.player1.clickCard(context.forcedSurrender);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.handSize).toBe(4);
                expect(context.player2.handSize).toBe(0);
                expect(context.p2Base.damage).toBe(p2BaseDamageBeforeForceSurrender);

                reset();
            });
        });
    });
});
