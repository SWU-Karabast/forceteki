describe('Ki Adi Mundi, Composed and Confident', function() {
    integration(function(contextRef) {
        describe('Ki Adi Mundi, Composed and Confident\'s ability', function () {
            it('should trigger when Opponent plays its second card during that phase and Coordinate is active', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['kiadimundi#composed-and-confident', '41st-elite-corps', 'clone-heavy-gunner'],
                        deck: ['battlefield-marine', 'freelance-assassin']
                    },
                    player2: {
                        hand: ['confiscate', 'atst']
                    }
                });

                const { context } = contextRef;

                // Coordinate is active
                context.player1.passAction();
                context.player2.clickCard(context.confiscate); // Play first card
                context.player1.passAction();
                context.player2.clickCard(context.atst); // Play second card

                expect(context.player1).toHavePassAbilityPrompt('Draw 2 cards');
                context.player1.clickPrompt('Draw 2 cards');

                expect(context.player1.handSize).toBe(2);
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.freelanceAssassin).toBeInZone('hand');
            });

            it('should not trigger when Opponent plays its second card as Coordinate is not active', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['kiadimundi#composed-and-confident', '41st-elite-corps'],
                        deck: ['battlefield-marine', 'freelance-assassin']
                    },
                    player2: {
                        hand: ['confiscate', 'atst']
                    }
                });

                const { context } = contextRef;

                // Coordinate is active
                context.player1.passAction();
                context.player2.clickCard(context.confiscate); // Play first card
                context.player1.passAction();
                context.player2.clickCard(context.atst); // Play second card nothing happens

                expect(context.player1).toBeActivePlayer();
                expect(context.player1.handSize).toBe(0);
                expect(context.battlefieldMarine).toBeInZone('deck');
                expect(context.freelanceAssassin).toBeInZone('deck');
            });

            it('should trigger when unit is played after first card and Coordinate is active while playing second card', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['kiadimundi#composed-and-confident'],
                        groundArena: ['clone-heavy-gunner', '41st-elite-corps'],
                        deck: ['battlefield-marine', 'freelance-assassin']
                    },
                    player2: {
                        hand: ['confiscate', 'atst']
                    }
                });

                const { context } = contextRef;

                // Coordinate is active
                context.player1.passAction();
                context.player2.clickCard(context.confiscate); // Opponent Play first card
                context.player1.clickCard(context.kiadimundi); // Ki Adi Mundi enters in play and activates Coordinate
                context.player2.clickCard(context.atst); // Opponent plays second card nothing happens

                expect(context.player1).toHavePassAbilityPrompt('Draw 2 cards');
                context.player1.clickPrompt('Draw 2 cards');

                expect(context.player1.handSize).toBe(2);
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.freelanceAssassin).toBeInZone('hand');
            });
        });
    });
});
