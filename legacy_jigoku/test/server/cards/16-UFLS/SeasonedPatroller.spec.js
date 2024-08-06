describe('Seasoned Patroller', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai', 'seasoned-patroller'],
                    hand: ['command-by-name', 'a-perfect-cut'],
                    dynastyDiscard: ['reserve-tents']
                },
                player2: {
                    hand: ['nezumi-infiltrator', 'specialized-defenses'],
                    stronghold: ['shiro-gisu'],
                    dynastyDiscard: ['kansen-haunt', 'kaiu-forges']
                }
            });

            this.brashSamurai = this.player1.findCardByName('brash-samurai');
            this.patroller = this.player1.findCardByName('seasoned-patroller');
            this.command = this.player1.findCardByName('command-by-name');
            this.cut = this.player1.findCardByName('a-perfect-cut');
            this.tents = this.player1.findCardByName('reserve-tents');

            this.infiltrator = this.player2.findCardByName('nezumi-infiltrator');
            this.defenses = this.player2.findCardByName('specialized-defenses');
            this.gisu = this.player2.findCardByName('shiro-gisu');
            this.haunt = this.player2.findCardByName('kansen-haunt');
            this.forges = this.player2.findCardByName('kaiu-forges');

            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player2.findCardByName('shameful-display', 'stronghold province');
            this.sd1.isBroken = true;
            this.sd2.isBroken = true;
            this.sd3.isBroken = true;

            this.player1.placeCardInProvince(this.tents, 'province 1');
            this.tents.facedown = false;
        });

        describe('While participating', function() {
            it('should prevent strength from being increased by the stronghold', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.patroller],
                    defenders: [],
                    province: this.sd5,
                    ring: 'void'
                });

                expect(this.sd5.getStrength()).toBe(3);
            });

            it('should prevent strength from being increased by a lasting effect', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.patroller],
                    defenders: [],
                    province: this.sd5,
                    ring: 'void'
                });

                this.player2.clickCard(this.defenses);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.sd5.getStrength()).toBe(3);
            });

            it('should not prevent strength from being lowered by a lasting effect', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.patroller],
                    defenders: [],
                    province: this.sd5,
                    ring: 'void'
                });

                this.player2.clickCard(this.infiltrator);
                this.player2.clickPrompt('0');
                this.player2.clickPrompt('Conflict');
                this.player2.clickCard(this.infiltrator);
                expect(this.player2).not.toHavePromptButton('Raise attacked province\'s strength by 1');
                expect(this.player2).toHavePromptButton('Lower attacked province\'s strength by 1');
                this.player2.clickPrompt('Lower attacked province\'s strength by 1');
                expect(this.sd5.getStrength()).toBe(2);
            });

            it('should not prevent strength from being set', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.patroller],
                    defenders: [],
                    province: this.sd5,
                    ring: 'void'
                });

                this.player2.pass();
                this.player1.clickCard(this.command);
                this.player1.clickCard(this.cut);
                expect(this.sd5.getStrength()).toBe(0);
            });

            it('should prevent holdings from increasing strength', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.patroller],
                    defenders: [],
                    province: this.sd4,
                    ring: 'void'
                });

                this.player2.placeCardInProvince(this.forges, 'province 4');
                this.game.checkGameState(true);
                expect(this.sd4.getStrength()).toBe(3);
            });

            it('should allow holdings to reduce strength', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.patroller],
                    defenders: [],
                    province: this.sd4,
                    ring: 'void'
                });

                this.player2.moveCard(this.haunt, 'province 4');
                this.game.checkGameState(true);
                expect(this.sd4.getStrength()).toBe(1);
            });
        });

        describe('While not participating', function() {
            it('should allow strength to be increased by the stronghold', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brashSamurai],
                    defenders: [],
                    province: this.sd5,
                    ring: 'void'
                });

                expect(this.sd5.getStrength()).toBe(5);
            });

            it('should allow strength to be increased by a lasting effect', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brashSamurai],
                    defenders: [],
                    province: this.sd5,
                    ring: 'void'
                });

                this.player2.clickCard(this.defenses);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.sd5.getStrength()).toBe(10);
            });

            it('should not prevent strength from being lowered by a lasting effect', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brashSamurai],
                    defenders: [],
                    province: this.sd5,
                    ring: 'void'
                });

                this.player2.clickCard(this.infiltrator);
                this.player2.clickPrompt('0');
                this.player2.clickPrompt('Conflict');
                this.player2.clickCard(this.infiltrator);
                expect(this.player2).toHavePromptButton('Raise attacked province\'s strength by 1');
                expect(this.player2).toHavePromptButton('Lower attacked province\'s strength by 1');
                this.player2.clickPrompt('Raise attacked province\'s strength by 1');
                expect(this.sd5.getStrength()).toBe(6);
            });

            it('should not prevent strength from being set', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brashSamurai],
                    defenders: [],
                    province: this.sd5,
                    ring: 'void'
                });

                this.player2.pass();
                this.player1.clickCard(this.command);
                this.player1.clickCard(this.cut);
                expect(this.sd5.getStrength()).toBe(2);
            });

            it('should allow holdings to increasing strength', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brashSamurai],
                    defenders: [],
                    province: this.sd4,
                    ring: 'void'
                });

                this.player2.placeCardInProvince(this.forges, 'province 4');
                this.game.checkGameState(true);
                expect(this.sd4.getStrength()).toBe(6);
            });

            it('should allow holdings to reduce strength', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brashSamurai],
                    defenders: [],
                    province: this.sd4,
                    ring: 'void'
                });

                this.player2.moveCard(this.haunt, 'province 4');
                this.game.checkGameState(true);
                expect(this.sd4.getStrength()).toBe(1);
            });

            it('when moving in should remove all increases', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brashSamurai],
                    defenders: [],
                    province: this.sd4,
                    ring: 'void'
                });

                this.player2.placeCardInProvince(this.forges, 'province 4');
                this.game.checkGameState(true);
                this.player2.clickCard(this.defenses);
                expect(this.sd4.getStrength()).toBe(12);
                this.player1.pass();
                this.player2.clickCard(this.infiltrator);
                this.player2.clickPrompt('0');
                this.player2.clickPrompt('Conflict');
                this.player2.clickCard(this.infiltrator);
                this.player2.clickPrompt('Raise attacked province\'s strength by 1');
                expect(this.sd4.getStrength()).toBe(14);

                this.player1.clickCard(this.tents);
                this.player1.clickCard(this.patroller);
                expect(this.sd4.getStrength()).toBe(3);
            });
        });
    });
});
