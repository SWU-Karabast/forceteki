describe('Partisan Insurgent', function () {
    integration(function () {
        describe('Partisan Insurgent\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['keep-fighting'],
                        groundArena: ['partisan-insurgent'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        spaceArena: ['system-patrol-craft']
                    }
                });
            });

            it('should give Raid 2 while having Aggression units ', function () {
                // attack with partisan insurgent, a-wing is here so damage should be 3
                this.player1.clickCard(this.partisanInsurgent);
                expect(this.player2).toBeActivePlayer();
                expect(this.p2Base.damage).toBe(3);

                // kill a-wing
                this.player2.clickCard(this.systemPatrolCraft);
                this.player2.clickCard(this.greenSquadronAwing);
                expect(this.greenSquadronAwing.location).toBe('discard');

                // attack again with partisan insurgent, damage should be 1 because a-wing is dead
                this.player1.clickCard(this.keepFighting);
                this.player1.clickCard(this.partisanInsurgent);
                this.player2.passAction();
                this.player1.clickCard(this.partisanInsurgent);
                expect(this.p2Base.damage).toBe(4);
            });
        });
    });
});
