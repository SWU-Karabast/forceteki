describe('Ki Adi Mundi, Composed and Confident', function() {
    integration(function(contextRef) {
        describe('Ki Adi Mundi, Composed and Confident\'s ability', function () {
            it('should trigger when Opponent plays its second card during that phase and Coordinate is active', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['41st-elite-corps', 'specforce-soldier'],
                        hand: ['kiadimundi#composed-and-confident', 'waylay'],
                        deck: ['battlefield-marine', 'freelance-assassin', 'kashyyyk-defender', 'consular-security-force']
                    },
                    player2: {
                        hand: ['confiscate', 'atst', 'blood-sport', 'death-star-stormtrooper', 'tieln-fighter', 'wampa']
                    }
                });

                const { context } = contextRef;

                // Playing Ki Adi Mundi from hand after first card played
                context.player1.passAction();
                context.player2.clickCard(context.confiscate); // Opponent Play first card
                context.player1.clickCard(context.kiadimundi); // Ki Adi Mundi enters in play and enable Coordinate
                context.player2.clickCard(context.atst); // Opponent plays second card, ability triggers

                expect(context.player1).toHavePassAbilityPrompt('Draw 2 cards');
                context.player1.clickPrompt('Draw 2 cards');

                expect(context.player1.handSize).toBe(3);
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

                context.player2.clickCard(context.deathStarStormtrooper); // Opponent plays third card, nothing should happend
                expect(context.player1).toBeActivePlayer();

                // Waylayed unit played twice should trigger Ki Adi Mundi's ability
                context.moveToNextActionPhase();

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.wampa);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('Draw 2 cards');
                context.player1.clickPrompt('Draw 2 cards');
                expect(context.consularSecurityForce).toBeInZone('hand');
                expect(context.kashyyykDefender).toBeInZone('hand');
            });
        });
    });
});
