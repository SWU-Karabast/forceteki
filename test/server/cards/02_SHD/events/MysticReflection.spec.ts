describe('Mystic Reflection', function() {
    integration(function(contextRef) {
        describe('Mystic Reflection\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mystic-reflection'],
                        groundArena: ['yoda#old-master'],
                    },
                    player2: {
                        groundArena: ['specforce-soldier'],
                        spaceArena: ['green-squadron-awing'],
                    }
                });
            });

            it('should give -2/-2 to an enemy unit while controlling a force unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mysticReflection);
                expect(context.player1).toBeAbleToSelectExactly([context.specforceSoldier, context.greenSquadronAwing]);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing.getPower()).toBe(0);
                expect(context.greenSquadronAwing.getHp()).toBe(1);

                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.p1Base.damage).toBe(1);
            });
        });

        describe('Mystic Reflection\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mystic-reflection'],
                    },
                    player2: {
                        groundArena: ['specforce-soldier'],
                        spaceArena: ['green-squadron-awing'],
                    }
                });
            });

            it('should give -2/-0 to an enemy unit if we do not control a force unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mysticReflection);
                expect(context.player1).toBeAbleToSelectExactly([context.specforceSoldier, context.greenSquadronAwing]);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing.getPower()).toBe(0);
                expect(context.greenSquadronAwing.getHp()).toBe(3);

                // on next action phase, effect should be reset
                context.moveToNextActionPhase();
                expect(context.greenSquadronAwing.getPower()).toBe(1);
                expect(context.greenSquadronAwing.getHp()).toBe(3);
            });
        });
    });
});
