describe('Ki Adi Mundi, Composed and Confident', function() {
    integration(function(contextRef) {
        describe('Ki Adi Mundi, Composed and Confident\'s ability', function () {
            xit('should trigger when Opponent plays its second card during that phase and Coordinate is active', async function () {
                await contextRef.setupTestAsync({
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
                context.player2.clickPrompt('Play anyway');
                context.player1.clickCard(context.kiadimundi); // Ki Adi Mundi enters in play and enable Coordinate
                context.player2.clickCard(context.atst); // Opponent plays second card, ability triggers

                expect(context.player1).toHavePassAbilityPrompt('Draw 2 cards');
                context.player1.clickPrompt('Trigger');

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
                context.player1.clickPrompt('Trigger');
                expect(context.consularSecurityForce).toBeInZone('hand');
                expect(context.kashyyykDefender).toBeInZone('hand');
            });

            xit('should not trigger when playing units owned by the opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['stolen-athauler'],
                    },
                    player2: {
                        hand: ['takedown'],
                        groundArena: ['kiadimundi#composed-and-confident', 'battlefield-marine', 'wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.stolenAthauler);

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.stolenAthauler);

                context.player1.passAction();

                context.player2.clickCard(context.stolenAthauler);

                expect(context.player1).toBeActivePlayer();
            });

            it('should only trigger once if the second card plays has a nested trigger to play another card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'home-one#alliance-flagship'],
                        discard: [
                            'battlefield-marine'
                        ]
                    },
                    player2: {
                        groundArena: [
                            'kiadimundi#composed-and-confident',
                            'luke-skywalker#jedi-knight',
                            'consular-security-force'
                        ],
                    },
                });

                const { context } = contextRef;

                // Play Sneak Attack to play Home One
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.homeOne);

                // Players have simultaneous triggers, choose to reslolve P1's first
                context.player1.clickPrompt('You');

                // Play Battlefield Marine from discard
                context.player1.clickCard(context.battlefieldMarine);

                // P2 resolves Ki Adi Mundi's ability
                expect(context.player2).toHavePassAbilityPrompt('Draw 2 cards');
                context.player2.clickPrompt('Trigger');
                expect(context.player2.hand.length).toBe(2);
            });
        });
    });
});
