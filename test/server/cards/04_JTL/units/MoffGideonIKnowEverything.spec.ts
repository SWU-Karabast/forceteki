describe('Moff Gideon, I Know Everything', function() {
    integration(function(contextRef) {
        it('Moff Gideon\'s ability should ', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['echo-base-defender'],
                    groundArena: [{ card: 'moff-gideon#i-know-everything', upgrades: ['grievouss-wheel-bike'] }, 'battlefield-marine'],
                    leader: 'padme-amidala#serving-the-republic'
                },
                player2: {
                    hand: ['atst', 'jawa-scavenger', 'b1-security-team', 'droid-deployment'],
                    groundArena: ['wampa', 'saw-gerrera#resistance-is-not-terrorism'],
                    leader: 'rio-durant#wisecracking-wheelman',
                    base: 'echo-base'
                }
            });

            const { context } = contextRef;

            // attack base with moff gideon, all enemy unit costs 1 resource more
            context.player1.clickCard(context.moffGideon);
            context.player1.clickCard(context.p2Base);

            let exhaustedResourceCount = context.player2.exhaustedResourceCount;

            context.player2.clickCard(context.atst);
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 7);
            exhaustedResourceCount = context.player2.exhaustedResourceCount;

            // my unit does not cost 1 resource more
            context.player1.clickCard(context.echoBaseDefender);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            context.player2.clickCard(context.jawaScavenger);
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 2);
            exhaustedResourceCount = context.player2.exhaustedResourceCount;

            context.player1.passAction();

            // event does not cost more
            context.player2.clickCard(context.droidDeployment);
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 2);

            context.player2.moveCard(context.atst, 'hand');
            context.player2.moveCard(context.jawaScavenger, 'hand');
            context.player2.moveCard(context.droidDeployment, 'hand');
            context.player1.moveCard(context.echoBaseDefender, 'hand');

            context.moveToNextActionPhase();

            // attack base with another unit, nothing happens
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            exhaustedResourceCount = context.player2.exhaustedResourceCount;

            context.player2.clickCard(context.atst);
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 6);
            exhaustedResourceCount = context.player2.exhaustedResourceCount;

            context.player1.clickCard(context.echoBaseDefender);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            context.player2.clickCard(context.jawaScavenger);

            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 1);
            exhaustedResourceCount = context.player2.exhaustedResourceCount;

            context.player1.passAction();
            context.player2.clickCard(context.droidDeployment);
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 2);

            context.player2.moveCard(context.atst, 'hand');
            context.player2.moveCard(context.jawaScavenger, 'hand');
            context.player2.moveCard(context.droidDeployment, 'hand');
            context.player1.moveCard(context.echoBaseDefender, 'hand');

            context.moveToNextActionPhase();

            exhaustedResourceCount = context.player2.exhaustedResourceCount;

            // attack a unit with moff gideon without overwhelm, enemy units does not cost more resource
            context.player1.clickCard(context.moffGideon);
            context.player1.clickCard(context.sawGerrera);

            context.player2.clickCard(context.atst);
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 6);
            exhaustedResourceCount = context.player2.exhaustedResourceCount;

            // my unit does not cost 1 resource more
            context.player1.clickCard(context.echoBaseDefender);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            context.player2.clickCard(context.jawaScavenger);
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 1);
            exhaustedResourceCount = context.player2.exhaustedResourceCount;

            context.player1.passAction();

            // event does not cost more
            context.player2.clickCard(context.droidDeployment);
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 2);

            context.player2.moveCard(context.atst, 'hand');
            context.player2.moveCard(context.jawaScavenger, 'hand');
            context.player2.moveCard(context.droidDeployment, 'hand');
            context.player1.moveCard(context.echoBaseDefender, 'hand');

            context.moveToNextActionPhase();

            context.player1.passAction();
            context.player2.clickCard(context.b1SecurityTeam);
            context.player2.readyResources(1);

            exhaustedResourceCount = context.player2.exhaustedResourceCount;

            // attack a unit with moff gideon + overwhelm, all enemy units cost 1 resource more
            context.player1.clickCard(context.moffGideon);
            context.player1.clickCard(context.b1SecurityTeam);

            context.player2.clickCard(context.atst);
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 7);
            exhaustedResourceCount = context.player2.exhaustedResourceCount;

            // my unit does not cost 1 resource more
            context.player1.clickCard(context.echoBaseDefender);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            context.player2.clickCard(context.jawaScavenger);
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 2);
            exhaustedResourceCount = context.player2.exhaustedResourceCount;

            context.player1.passAction();

            // event does not cost more
            context.player2.clickCard(context.droidDeployment);
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 2);
        });
    });
});
