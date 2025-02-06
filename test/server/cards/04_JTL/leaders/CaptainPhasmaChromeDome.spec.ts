
describe('Captain Phasma, Chrome Dome', function() {
    integration(function(contextRef) {
        describe('Captain Phasma, Chrome Dome\'s undeployed ability', function() {
            it('should only have an effect if the controller played a First Order card this phase, but still be usable otherwise', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['kylos-tie-silencer#ruthlessly-efficient'],
                        groundArena: ['supreme-leader-snoke#shadow-ruler'],
                        leader: 'captain-phasma#chrome-dome'
                    },
                    player2: {
                        hand: ['kylo-ren#killing-the-past'],
                        spaceArena: ['alliance-xwing'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Opponent plays the first First Order card
                context.player1.passAction();
                context.player2.clickCard(context.kyloRen);

                // No First Order card played by controller but 1 in play and 1 played by the opponent; ability should not trigger
                context.player1.clickCard(context.captainPhasma);
                context.player1.clickPrompt('Deal 1 damage to a base');

                expect(context.captainPhasma.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);

                // Play First Order Card
                context.captainPhasma.exhausted = false;
                context.player2.passAction();
                context.player1.clickCard(context.kylosTieSilencer);
                context.player2.passAction();

                // Use ability with effect
                context.player1.clickCard(context.captainPhasma);
                context.player1.clickPrompt('Deal 1 damage to a base');

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.captainPhasma.exhausted).toBe(true);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);
            });
        });

        describe('Captain Phasma, Chrome Domer\'s deployed ability', function() {
            it('should optionally deal 1 damage to any unit and base on attack', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['kylo-ren#killing-the-past'],
                        groundArena: ['supreme-leader-snoke#shadow-ruler'],
                        leader: { card: 'captain-phasma#chrome-dome', deployed: true }
                    },
                    player2: {
                        spaceArena: ['bright-hope#the-last-transport'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                // Play First Order Card
                context.player1.clickCard(context.kyloRen);
                context.player2.passAction();

                context.player1.clickCard(context.captainPhasma);
                context.player1.clickCard(context.p2Base);

                // Damage to a unit (optional)
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHavePrompt('Choose a unit');
                context.player1.clickCard(context.brightHope);

                // Damage to a base (not optional)
                expect(context.player1).toHavePrompt('Choose a base');
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.brightHope.damage).toBe(1);
                expect(context.p2Base.damage).toBe(5); // 4 from Phasma, 1 from the ability

                // Test pass ability

                // Restart board state
                context.player2.passAction();
                context.captainPhasma.exhausted = false;

                context.player1.clickCard(context.captainPhasma);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHavePrompt('Choose a unit');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();

                // Next action phase ability should not be triggered as not First Order card played
                context.moveToNextActionPhase();
                context.player1.clickCard(context.captainPhasma);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
