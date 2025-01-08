describe('Ki Adi Mundi, Composed and Confident', function() {
    integration(function(contextRef) {
        describe('Ki Adi Mundi, Composed and Confident\'s ability', function () {
            it('should trigger when Opponent plays its second card during that phase and Coordinate is active', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['kiadimundi#composed-and-confident', '41st-elite-corps', 'specforce-soldier'],
                        deck: ['battlefield-marine', 'freelance-assassin']
                    },
                    player2: {
                        hand: ['confiscate', 'atst', 'blood-sport', 'vanquish', 'tieln-fighter']
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

                // Coordinate is not active
                context.moveToNextActionPhase();

                context.player1.clickCard(context.freelanceAssassin);
                context.player1.clickPrompt('Pass'); // Skips unit ability
                context.player2.clickCard(context.bloodSport); // Opponent plays first card, eliminates Coordinate by defeating Specforce Soldier and Freelance Assasin
                context.player1.passAction();

                expect(context.player1.getCardsInZone('groundArena').length).toBe(2);
                context.player2.clickCard(context.tielnFighter); // Opponent plays second card nothing happens
                expect(context.player1).toBeActivePlayer();

                context.player1.clickCard(context.battlefieldMarine); // Coordinate is active
                expect(context.player1.getCardsInZone('groundArena').length).toBe(3);
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.vanquish); // Opponent plays third card, nothing should happend
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeActivePlayer();
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
                context.player2.clickCard(context.atst); // Opponent plays second card, ability triggers

                expect(context.player1).toHavePassAbilityPrompt('Draw 2 cards');
                context.player1.clickPrompt('Draw 2 cards');

                expect(context.player1.handSize).toBe(2);
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.freelanceAssassin).toBeInZone('hand');
            });
        });
    });
});
