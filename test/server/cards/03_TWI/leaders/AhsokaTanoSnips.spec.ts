
describe('Ahsoka Tano, Snips', function () {
    integration(function (contextRef) {
        describe('Ahsoka Tano\'s leader undeployed ability', function () {
            it('should activate with coordinate and allow to attack with a unit with +1/+0', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['isb-agent'],
                        groundArena: ['battlefield-marine', 'crafty-smuggler', 'specforce-soldier'],
                        leader: 'ahsoka-tano#snips',
                        base: 'jabbas-palace',
                        resources: 3
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                    },
                });

                const { context } = contextRef;

                // Player 1 triggers Coordinate ability on Ahsoka Tano
                context.player1.clickCard(context.ahsokaTano);
                expect(context.ahsokaTano.deployed).toBe(false);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.craftySmuggler, context.specforceSoldier]);

                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);

                // Moves to the next turn
                context.moveToNextActionPhase();

                // The Coordinate ability is not active anymore because the SpecForce Soldier was defeated
                context.player1.clickCardNonChecking(context.ahsokaTano);

                // Player 1 plays the ISB Agent and the unit side Coordinate ability is now active
                context.player1.clickCard(context.isbAgent);

                // Player 2 passes
                context.player2.passAction();

                // Player 1 attacks with the Battlefield Marine
                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(4);
            });

            it('is unregistered when deployed and registered when undeployed', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'crafty-smuggler', 'specforce-soldier'],
                        leader: 'ahsoka-tano#snips',
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: ['wampa', 'atst'],
                    },
                });

                const { context } = contextRef;

                // Player 1 deploys Ahsoka Tano
                context.player1.clickCard(context.ahsokaTano);
                expect(context.player1).toHaveEnabledPromptButton('Attack with a unit. It gets +1/+0 for this attack');
                context.player1.clickPrompt('Deploy Ahsoka Tano');
                expect(context.ahsokaTano.deployed).toBe(true);

                // Player 2 passes
                context.player2.passAction();

                // Player 1 attacks with Ashoka Tano
                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickCard(context.p2Base);

                // Player 2 defeats Ashoka Tano
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.ahsokaTano);

                expect(context.ahsokaTano.deployed).toBe(false);

                // Moves to the next turn
                context.moveToNextActionPhase();

                // Player 1 deploys Ahsoka Tano
                context.player1.clickCard(context.ahsokaTano);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(4);
            });
        });

        describe('Ahsoka Tano\'s leader deployed ability', function () {
            it('should activate with Coordinate and give her +2/+0', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['isb-agent', 'battlefield-marine'],
                        groundArena: ['specforce-soldier'],
                        leader: { card: 'ahsoka-tano#snips', deployed: true },
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                    },
                });

                const { context } = contextRef;

                expect(context.ahsokaTano.getPower()).toBe(3);

                // Player 1 playes Battlefield Marine and activates the Coordinate ability
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.ahsokaTano.getPower()).toBe(5);

                // Player 2 defeats the Battlefield Marine and Ahsoka Tano loses the Coordinate ability
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.ahsokaTano.getPower()).toBe(3);

                // Player 1 plays the ISB Agent
                context.player1.clickCard(context.isbAgent);

                // The unit side Coordinate ability is now active
                expect(context.ahsokaTano.getPower()).toBe(5);
            });
        });
    });
});
