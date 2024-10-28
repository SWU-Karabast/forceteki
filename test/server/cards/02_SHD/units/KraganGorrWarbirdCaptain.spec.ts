describe('Kragan Goor, Warbird Captain', function () {
    integration(function (contextRef) {
        describe('Kragan Goor\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['kragan-gorr#warbird-captain', 'battlefield-marine', 'vanguard-infantry'],
                        spaceArena: ['green-squadron-awing', 'restored-arc170']
                    },
                    player2: {
                        groundArena: ['swoop-racer', 'scout-bike-pursuer'],
                        spaceArena: ['distant-patroller']
                    }
                });
            });

            it('should give a shield to a friendly unit in the same area as attacker when he attacks my base', function () {
                const { context } = contextRef;

                // we attack base, nothing happen
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // enemy attack unit, nothing happen
                context.player2.clickCard(context.swoopRacer);
                context.player2.clickCard(context.battlefieldMarine);

                // a ground enemy attacks base, we should give shield to a friendly ground unit
                context.player1.passAction();
                context.player2.clickCard(context.scoutBikePursuer);
                context.player2.clickCard(context.p1Base);
                expect(context.player1).toBeAbleToSelectExactly([context.kraganGorr, context.vanguardInfantry]);

                // give shield to vanguard infantry
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.vanguardInfantry).toHaveExactUpgradeNames(['shield']);

                // a space enemy attacks base, we should give shield to a friendly ground unit
                context.player1.passAction();
                context.player2.clickCard(context.distantPatroller);
                context.player2.clickCard(context.p1Base);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.restoredArc170]);

                // give shield to green squadron a-wing
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});
