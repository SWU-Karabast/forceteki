describe('Ahsoka Tano, Snips', function () {
    integration(function (contextRef) {
        it('Ahsoka Tano\'s leader undeployed ability should activate with coordinate and allow to attack with a unit and the deployed side should activate with coordinate', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['isb-agent'],
                    groundArena: ['battlefield-marine', 'crafty-smuggler', 'specforce-soldier'],
                    leader: 'ahsoka-tano#snips',
                },
                player2: {
                    hand: ['rivals-fall'],
                    groundArena: ['wampa', 'atst'],
                },
            });

            const { context } = contextRef;

            // Player 1 triggers Coordinate ability on Ahsoka Tano
            context.player1.clickCard(context.ahsokaTano);
            expect(context.ahsokaTano.deployed).toBe(false);
            context.player1.clickPrompt('Attack with a unit. It gets +1/+0 for this attack');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.craftySmuggler, context.specforceSoldier]);

            // The Coordinate ability is not active anymore because the SpecForce Soldier was defeated
            context.player1.clickCard(context.specforceSoldier);
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(3);

            // Moves to the next turn
            context.moveToNextActionPhase();

            // Player 1 deploys Ahsoka Tano
            context.player1.clickCard(context.ahsokaTano);
            expect(context.ahsokaTano.deployed).toBe(true);

            // The unit side Coordinate ability is now active
            expect(context.ahsokaTano.getPower()).toBe(5);

            // Player 2 passes
            context.player2.passAction();

            // Player 1 attacks with Ashoka Tano
            context.player1.clickCard(context.ahsokaTano);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);

            // Player 2 defeats the Battlefield Marine and Assault Tano loses the Coordinate ability
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.ahsokaTano.getPower()).toBe(3);

            // Player 1 plays the ISB Agent
            context.player1.clickCard(context.isbAgent);

            // The unit side Coordinate ability is now active
            expect(context.ahsokaTano.getPower()).toBe(5);

            // Player 2 defeats Ashoka Tano and the Coordinate ability is not active anymore
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.ahsokaTano);

            // Moves to the next turn
            context.moveToNextActionPhase();

            // Player 1 attacks with the ISB Agent
            context.player1.clickCardNonChecking(context.ahsokaTano);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
