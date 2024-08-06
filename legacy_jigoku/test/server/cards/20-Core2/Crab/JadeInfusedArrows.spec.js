describe('Jade Infused Arrows', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai', 'goblin-sneak', 'kaiu-envoy']
                },
                player2: {
                    inPlay: ['borderlands-defender'],
                    hand: ['jade-infused-arrows']
                }
            });

            this.borderlands = this.player2.findCardByName('borderlands-defender');
            this.arrows = this.player2.findCardByName('jade-infused-arrows');

            this.brash = this.player1.findCardByName('brash-samurai');
            this.goblin = this.player1.findCardByName('goblin-sneak');
            this.taintedEnvoy = this.player1.findCardByName('kaiu-envoy');
            this.taintedEnvoy.taint();

            this.player1.pass();
            this.player2.clickCard(this.arrows);
            this.player2.clickCard(this.borderlands);
            this.noMoreActions();
        });

        it('against normal characters', function () {
            const borderlandsMilInit = this.borderlands.getMilitarySkill();
            this.initiateConflict({
                attackers: [this.brash],
                defenders: [this.borderlands],
                type: 'military'
            });

            this.player2.clickCard(this.arrows);
            expect(this.borderlands.getMilitarySkill()).toBe(borderlandsMilInit + 2);
            expect(this.getChatLogs(5)).toContain(
                'player2 uses Jade-Infused Arrows, spending 1 fate to give +2military to Borderlands Defender'
            );
        });

        it('against corrupt characters', function () {
            const borderlandsMilInit = this.borderlands.getMilitarySkill();
            this.initiateConflict({
                attackers: [this.goblin],
                defenders: [this.borderlands],
                type: 'military'
            });

            this.player2.clickCard(this.arrows);
            expect(this.borderlands.getMilitarySkill()).toBe(borderlandsMilInit + 4);
            expect(this.getChatLogs(5)).toContain(
                'player2 uses Jade-Infused Arrows, spending 1 fate to give +4military to Borderlands Defender - the jade is potent against the spawns of jigoku!'
            );
        });

        it('against tainted characters', function () {
            const borderlandsMilInit = this.borderlands.getMilitarySkill();
            this.initiateConflict({
                attackers: [this.taintedEnvoy],
                defenders: [this.borderlands],
                type: 'military'
            });

            this.player2.clickCard(this.arrows);
            expect(this.borderlands.getMilitarySkill()).toBe(borderlandsMilInit + 4);
            expect(this.getChatLogs(5)).toContain(
                'player2 uses Jade-Infused Arrows, spending 1 fate to give +4military to Borderlands Defender - the jade is potent against the spawns of jigoku!'
            );
        });
    });
});
