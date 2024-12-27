describe('Home One', function () {
    integration(function (contextRef) {
        describe('Home One\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['home-one#alliance-flagship', 'alliance-xwing'],
                        base: { card: 'echo-base', damage: 10 },
                    },
                    player2: {
                        groundArena: ['rugged-survivors', 'cargo-juggernaut'],
                        spaceArena: ['bright-hope#the-last-transport']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give Restore 1 to friendly units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.ruggedSurvivors, context.cargoJuggernaut]);

                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(3);
                expect(context.p1Base.damage).toBe(9);

                context.player2.passAction();

                // should give Restore 1 for space units as well
                context.player1.clickCard(context.allianceXwing);

                expect(context.p1Base.damage).toBe(8);

                context.player2.clickCard(context.brightHope);
                context.player2.clickCard(context.p1Base);

                // enemy units shouldn't have restore 1, p2 base damage should still be 3
                expect(context.p2Base.damage).toBe(3);

                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Home One\'s when played ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        hand: ['home-one#alliance-flagship'],
                        base: 'echo-base',
                        leader: 'han-solo#audacious-smuggler',
                        discard: ['echo-base-defender', 'crafty-smuggler', 'chewbacca#loyal-companion'],
                        resources: 8
                    },
                    player2: {
                        groundArena: ['rugged-survivors', 'cargo-juggernaut']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should play a heroic unit that costs 3 or less from the discard pile for free', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.homeOne);

                // should skip prompt if only one valid target is found
                expect(context.echoBaseDefender).toBeInZone('groundArena');

                // should only exhaust resources up to home one's cost
                expect(context.player1.exhaustedResourceCount).toBe(8);

                expect(context.player2).toBeActivePlayer();
            });

            it('should play a heroic unit that costs more than 3 resources from the discard pile with discount', function () {
                const { context } = contextRef;

                context.player1.setResourceCount(11);

                context.player1.clickCard(context.homeOne);

                expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.chewbacca]);

                context.player1.clickCard(context.chewbacca);

                expect(context.chewbacca).toBeInZone('groundArena');

                // should exhaust resources up to home one's cost + chewbacca's cost with discount
                expect(context.player1.exhaustedResourceCount).toBe(10);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Home One\'s when played ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        hand: ['home-one#alliance-flagship'],
                        base: 'echo-base',
                        leader: 'han-solo#audacious-smuggler',
                        discard: ['general-rieekan#defensive-strategist', 'crafty-smuggler', 'chewbacca#loyal-companion'],
                        resources: 9
                    },
                    player2: {
                        groundArena: ['rugged-survivors', 'cargo-juggernaut']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should not trigger if no valid targets are found', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.homeOne);

                // should only exhaust resources up to home one's cost
                expect(context.player1.exhaustedResourceCount).toBe(8);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});