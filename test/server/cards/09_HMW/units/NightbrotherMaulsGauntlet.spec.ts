describe('Nightbrother, Maul\'s Gauntlet', function () {
    integration(function (contextRef) {
        describe('Nightbrother\'s when played ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nightbrother#mauls-gauntlet'],
                        discard: ['wampa', 'superlaser-technician', 'protector', 'mastery'],
                        base: 'jabbas-palace',
                        leader: 'maul#a-rival-in-darkness',
                    },
                    player2: {
                        groundArena: ['atst'],
                        discard: ['battlefield-marine']
                    }
                });
            });

            it('should play a unit from discard for 3 less, entering ready, and defeat it at the next regroup phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nightbrother);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.superlaserTechnician]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(8);
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.wampa.exhausted).toBeFalse();

                context.moveToRegroupPhase();
                expect(context.wampa).toBeInZone('discard');
            });

            it('should play a unit from discard for 3 less, entering ready, do not defeat it at the next regroup phase if unit is already defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nightbrother);
                context.player1.clickCard(context.superlaserTechnician);

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.superlaserTechnician);

                expect(context.player1).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.superlaserTechnician).toBeInZone('resource', context.player1);

                context.moveToRegroupPhase();

                expect(context.superlaserTechnician).toBeInZone('resource', context.player1);
            });

            it('should do nothing if passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nightbrother);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.wampa).toBeInZone('discard');

                context.player2.passAction();
            });
        });

        it('should be able to play Stolen AT-Hauler from own discard after the opponent defeats it this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['nightbrother#mauls-gauntlet'],
                    spaceArena: ['stolen-athauler'],
                    base: 'jabbas-palace',
                    leader: 'maul#a-rival-in-darkness',
                },
                player2: {
                    hand: ['takedown'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Player 2 defeats the Stolen AT-Hauler
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.stolenAthauler);

            // It goes to its owner's (Player 1's) discard pile
            expect(context.stolenAthauler).toBeInZone('discard', context.player1);

            // Player 1 plays Nightbrother and can select the Stolen AT-Hauler
            context.player1.clickCard(context.nightbrother);
            expect(context.player1).toBeAbleToSelectExactly([context.stolenAthauler]);
            context.player1.clickCard(context.stolenAthauler);

            // Stolen AT-Hauler is played for 3 less (free) and enters play ready
            expect(context.player2).toBeActivePlayer();
            expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);
            expect(context.stolenAthauler.exhausted).toBeFalse();
            expect(context.player1.exhaustedResourceCount).toBe(7);

            // It is still defeated at the start of the next regroup phase
            context.moveToRegroupPhase();
            expect(context.stolenAthauler).toBeInZone('discard', context.player1);
        });
    });
});
