describe('Partisan Insurgent', function () {
    integration(function (contextRef) {
        describe('Partisan Insurgent\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['keep-fighting'],
                        groundArena: ['partisan-insurgent'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        spaceArena: ['system-patrol-craft']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give Raid 2 while having Aggression units ', function () {
                const { context } = contextRef;

                // attack with partisan insurgent, a-wing is here so damage should be 3
                context.player1.clickCard(context.partisanInsurgent);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);

                // kill a-wing
                context.player2.clickCard(context.systemPatrolCraft);
                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing.zoneName).toBe('discard');

                // attack again with partisan insurgent, damage should be 1 because a-wing is dead
                context.player1.clickCard(context.keepFighting);
                context.player1.clickCard(context.partisanInsurgent);
                context.player2.passAction();
                context.player1.clickCard(context.partisanInsurgent);
                expect(context.p2Base.damage).toBe(4);
            });
        });
    });
});
