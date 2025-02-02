describe('Adelphi Patrol Wing', function () {
    integration(function (contextRef) {
        it('Adelphi Patrol Wing\'s when played ability should allow to trigger a unit to attack and if has initiative give it +2 power', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['restored-arc170'],
                    hand: ['adelphi-patrol-wing']
                },
                player2: {
                    groundArena: ['knight-of-the-republic'],
                    spaceArena: ['green-squadron-awing'],
                    hand: ['waylay']
                }
            });

            const { context } = contextRef;

            // play Adelphi attack with unit, gain +2
            context.player1.clickCard(context.adelphiPatrolWing);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.restoredArc170]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.knightOfTheRepublic);
            expect(context.knightOfTheRepublic.damage).toBe(5);

            // return Adelphi to hand, lose initiative, next action phase
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.adelphiPatrolWing);
            context.player1.clickCard(context.restoredArc170);
            context.player1.clickCard(context.p2Base);
            context.player2.claimInitiative();
            context.moveToNextActionPhase();

            // Play Adelphi, attack with unit, no power gain
            context.player2.clickCard(context.knightOfTheRepublic);
            context.player2.clickCard(context.p1Base);
            context.player1.clickCard(context.adelphiPatrolWing);
            expect(context.player1).toBeAbleToSelectExactly([context.restoredArc170]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.restoredArc170);
            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing.damage).toBe(2);
        });
    });
});
