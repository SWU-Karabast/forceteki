describe('Coronet, Stately Vessel', function () {
    integration(function (contextRef) {
        describe('Coronet\'s constant ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['coronet#stately-vessel'],
                        groundArena: ['battlefield-marine', 'death-trooper'],
                        base: { card: 'echo-base', damage: 3 }
                    },
                    player2: {
                        groundArena: ['advanced-recon-commando'],
                        base: { card: 'administrators-tower', damage: 3 }
                    }
                });
            });

            it('should give Restore 1 to other units', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(2);
            });

            it('should give Restore 1 to friendly non-heroism units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.deathTrooper);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(2);
            });

            it('should not give Restore 1 to Coronet itself ("each other")', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.coronetStatelyVessel);
                context.player1.clickCard(context.p2Base);
                // coronet has restore 1, should not get restore 2
                expect(context.p1Base.damage).toBe(2);
            });

            it('should not give Restore 1 to enemy units', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.advancedReconCommando);
                context.player2.clickCard(context.p1Base);
                expect(context.p2Base.damage).toBe(3);
            });
        });
    });
});
