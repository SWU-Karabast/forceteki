describe('Hound\'s Tooth, Reliable and Deadly', function() {
    integration(function(contextRef) {
        it('Hound\'s Tooth\'s ability should deal damage before defender if it is exhausted and it did not enter play this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'hounds-tooth#reliable-and-deadly', capturedUnits: ['green-squadron-awing'] }],
                },
                player2: {
                    hand: ['strafing-gunship', 'republic-arc170', 'headhunter-squadron'],
                }
            });

            const { context } = contextRef;

            context.player1.passAction();
            // play headhunter squadron
            context.player2.clickCard(context.headhunterSquadron);

            // attack it with hound's tooth, it enters this phase, not dealing damage before defender
            context.player1.clickCard(context.houndsTooth);
            context.player1.clickCard(context.headhunterSquadron);
            expect(context.houndsTooth.damage).toBe(1);

            // play republic arc 170 and strafing gunship
            context.player2.clickCard(context.republicArc170);
            context.player1.passAction();
            context.player2.clickCard(context.strafingGunship);

            context.moveToNextActionPhase();

            // attack an unexhausted unit, not dealing damage before defender
            context.player1.clickCard(context.houndsTooth);
            context.player1.clickCard(context.republicArc170);
            expect(context.houndsTooth).toBeInZone('discard');

            context.player1.moveCard(context.houndsTooth, 'spaceArena');

            context.player2.clickCard(context.strafingGunship);
            context.player2.clickCard(context.p1Base);

            context.houndsTooth.exhausted = false;

            // attack an exhausted unit which didn't enters play this phase, dealing damage before defender
            context.player1.clickCard(context.houndsTooth);
            context.player1.clickCard(context.strafingGunship);
            expect(context.houndsTooth.damage).toBe(0);
            expect(context.strafingGunship).toBeInZone('discard');

            context.houndsTooth.exhausted = false;
            context.player2.passAction();

            // attack a unit which was rescue this phase, hound's tooth should not deal damage before defender
            context.player1.clickCard(context.houndsTooth);
            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.houndsTooth.damage).toBe(1);
        });
    });
});
