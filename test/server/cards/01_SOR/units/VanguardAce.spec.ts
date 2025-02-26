describe('Vanguard Ace', function() {
    integration(function(contextRef) {
        describe('Vanguard Ace\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanguard-ace', 'daring-raid', 'battlefield-marine', 'academy-training', 'frontier-atrt'],
                    },
                    player2: {
                        hand: ['wampa', 'atst']
                    }
                });
            });

            it('gains 1 experience for each other card played by the controller this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.atst);

                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                context.player1.clickCard(context.vanguardAce);
                expect(context.vanguardAce).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
            });

            it('gains no experience if no other cards have been played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanguardAce);
                expect(context.vanguardAce.isUpgraded()).toBe(false);
            });

            it('does not count cards played in the previous phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.p2Base);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.atst);

                context.player1.clickCard(context.vanguardAce);
                expect(context.vanguardAce).toHaveExactUpgradeNames(['experience']);
            });

            // TODO TAKE CONTROL: check that state watchers still work if the card is played by the opponent
        });

        it('Vanguard Ace\'s ability counts a previous play of itself this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanguard-ace'],
                },
                player2: {
                    deck: ['atst'],
                    hand: ['waylay']
                }
            });

            const { context } = contextRef;

            // play Vanguard Ace, no ability trigger
            context.player1.clickCard(context.vanguardAce);
            expect(context.vanguardAce.isUpgraded()).toBe(false);

            // Waylay it back to hand
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.vanguardAce);

            // play Vanguard Ace again, ability triggers for one experience
            context.player1.clickCard(context.vanguardAce);
            expect(context.vanguardAce).toHaveExactUpgradeNames(['experience']);
        });
    });
});
