describe('Seasoned Shoretrooper', function () {
    integration(function () {
        describe('Seasoned Shoretrooper\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
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
                // with 5 resources it should not be buff
                expect(this.seasonedShoretrooper.getPower()).toBe(2);

                // valball : pass to refresh state as I cheat a bit with resources
                this.player1.moveCard(this.wampa, 'resource');
                this.player1.pass();

                // with 6 resources, power should be buff
                expect(this.player1.resources.length).toBe(6);
                expect(this.seasonedShoretrooper.getPower()).toBe(4);
                expect(this.seasonedShoretrooper.getHp()).toBe(3);

                // with 6 or more resources, power should be buff
                this.player1.moveCard(this.battlefieldMarine, 'resource');
                // soft-pass
                this.player2.clickCard(this.ruggedSurvivors);
                this.player2.clickCard(this.p1Base);
                expect(this.player1.resources.length).toBe(7);
                expect(this.seasonedShoretrooper.getPower()).toBe(4);
                expect(this.seasonedShoretrooper.getHp()).toBe(3);

                // remove 2 resources : seasoned shoretrooper lost its buff
                this.player1.moveCard(this.battlefieldMarine, 'hand', 'resource');
                this.player1.moveCard(this.wampa, 'hand', 'resource');
                this.player1.pass();
                expect(this.player1.resources.length).toBe(5);
                expect(this.seasonedShoretrooper.getPower()).toBe(2);
                expect(this.seasonedShoretrooper.getHp()).toBe(3);
            });
        });
    });
});
