describe('The Chaos of War', function() {
    integration(function(contextRef) {
        describe('The Chaos of War\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['the-chaos-of-war', 'battlefield-marine', 'echo-base-defender'],
                        groundArena: ['yoda#old-master'],
                    },
                    player2: {
                        hand: ['commission', 'daring-raid', 'moment-of-glory'],
                        spaceArena: ['green-squadron-awing'],
                    }
                });
            });

            it('should deal damage to base equal to controllers\' hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theChaosOfWar);

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda.damage).toBe(0);
                expect(context.greenSquadronAwing.damage).toBe(0);
                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(3);
            });
        });

        describe('The Chaos of War\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['the-chaos-of-war'],
                        groundArena: ['yoda#old-master'],
                    },
                    player2: {
                        hand: ['commission', 'daring-raid', 'moment-of-glory'],
                        spaceArena: ['green-squadron-awing'],
                    }
                });
            });

            it('should deal damage to base equal to controllers\' hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theChaosOfWar);

                expect(context.player2).toBeActivePlayer();
                expect(context.yoda.damage).toBe(0);
                expect(context.greenSquadronAwing.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(3);
            });
        });
    });
});
