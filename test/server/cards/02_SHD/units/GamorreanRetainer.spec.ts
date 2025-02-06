describe('Gamorrean Retainer', function () {
    integration(function (contextRef) {
        it('Gamorrean Retainer\'s ability should give it sentinel while he has a Command ally', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'scout-bike-pursuer'],
                    spaceArena: ['republic-arc170']
                },
                player2: {
                    hand: ['battlefield-marine'],
                    groundArena: ['gamorrean-retainer'],
                },
            });

            const { context } = contextRef;

            // attack with wampa, no command ally, can attack base
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);

            // play a command unit
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.player1).toBeActivePlayer();

            // gamorrean retainer has a command ally, now he has sentinel
            context.player1.clickCard(context.scoutBikePursuer);
            expect(context.player1).toBeAbleToSelectExactly([context.gamorreanRetainer]);
            context.player1.clickCard(context.gamorreanRetainer);

            expect(context.scoutBikePursuer.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
            expect(context.gamorreanRetainer.damage).toBe(1);
        });
    });
});
