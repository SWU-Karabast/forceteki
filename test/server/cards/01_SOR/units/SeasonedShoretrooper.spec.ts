describe('Seasoned Shoretrooper', function () {
    integration(function (contextRef) {
        describe('Seasoned Shoretrooper\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['wampa', 'battlefield-marine'],
                        groundArena: ['seasoned-shoretrooper'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['rugged-survivors']
                    }
                });
            });

            it('should buff him with 6 or more resources', function () {
                const { context } = contextRef;

                // with 5 resources it should not be buff
                expect(context.seasonedShoretrooper.getPower()).toBe(2);
                context.player1.clickCard(context.seasonedShoretrooper);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                // with 6 resources, power should be buff
                context.player1.moveCard(context.wampa, 'resource');
                // soft-pass
                context.player2.clickCard(context.ruggedSurvivors);
                context.player2.clickCard(context.p1Base);
                expect(context.player1.resources.length).toBe(6);
                expect(context.seasonedShoretrooper.getPower()).toBe(4);
                expect(context.seasonedShoretrooper.getHp()).toBe(3);

                // reset and check damage
                context.p2Base.damage = 0;
                context.seasonedShoretrooper.exhausted = false;
                context.player1.clickCard(context.seasonedShoretrooper);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                // with 6 or more resources, power should be buff
                context.p2Base.damage = 0;
                context.seasonedShoretrooper.exhausted = false;
                context.player1.moveCard(context.battlefieldMarine, 'resource');
                context.player2.passAction();
                expect(context.player1.resources.length).toBe(7);
                expect(context.seasonedShoretrooper.getPower()).toBe(4);
                expect(context.seasonedShoretrooper.getHp()).toBe(3);

                // reset and check damage
                context.p2Base.damage = 0;
                context.seasonedShoretrooper.exhausted = false;
                context.player1.clickCard(context.seasonedShoretrooper);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                // remove 2 resources : seasoned shoretrooper lost its buff
                context.player1.moveCard(context.battlefieldMarine, 'hand', 'resource');
                context.player1.moveCard(context.wampa, 'hand', 'resource');
                context.player2.passAction();
                expect(context.player1.resources.length).toBe(5);
                expect(context.seasonedShoretrooper.getPower()).toBe(2);
                expect(context.seasonedShoretrooper.getHp()).toBe(3);

                // reset and check damage
                context.p2Base.damage = 0;
                context.seasonedShoretrooper.exhausted = false;
                context.player1.clickCard(context.seasonedShoretrooper);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
            });
        });
    });
});
