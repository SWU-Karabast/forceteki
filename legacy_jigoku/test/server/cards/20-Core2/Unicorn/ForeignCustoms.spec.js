describe('Foreign Customs', function () {
    integration(function () {
        describe('action - ready', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        hand: ['foreign-customs'],
                        inPlay: ['adept-of-the-waves', 'sand-road-merchant', 'worldly-shiotome']
                    }
                });

                this.foreignCustoms = this.player1.findCardByName('foreign-customs');
                this.adept = this.player1.findCardByName('adept-of-the-waves');
                this.sandRoadMerchant = this.player1.findCardByName('sand-road-merchant');
                this.worldlyShiotome = this.player1.findCardByName('worldly-shiotome');
                this.adept.bow();
                this.sandRoadMerchant.bow();
                this.worldlyShiotome.bow();
            });

            it('can target non unicorns or foreign characters', function () {
                this.player1.clickCard(this.foreignCustoms);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toBeAbleToSelect(this.adept);
                expect(this.player1).toBeAbleToSelect(this.sandRoadMerchant);
                expect(this.player1).not.toBeAbleToSelect(this.worldlyShiotome);
            });

            it('readies the target', function () {
                this.player1.clickCard(this.foreignCustoms);
                this.player1.clickCard(this.adept);
                expect(this.adept.bowed).toBe(false);
            });
        });

        describe('Duel effect', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['doji-challenger', 'kakita-yoshi', 'daidoji-uji']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko', 'shiba-tsukune', 'doji-diplomat'],
                        dynastyDeck: ['moto-chagatai'],
                        hand: ['embrace-the-void', 'policy-debate', 'foreign-customs']
                    }
                });

                this.uji = this.player1.findCardByName('daidoji-uji');
                this.yoshi = this.player1.findCardByName('kakita-yoshi');
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.tsukune = this.player2.findCardByName('shiba-tsukune');
                this.diplomat = this.player2.findCardByName('doji-diplomat');
                this.pd = this.player2.findCardByName('policy-debate');
                this.foreignCustoms = this.player2.findCardByName('foreign-customs');
                this.chagatai = this.player2.placeCardInProvince('moto-chagatai', 'province 2');
                this.chagatai.facedown = false;
            });

            it('should react if you lose', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                this.player1.clickPrompt('2');
                this.player2.clickPrompt('1');

                this.player2.clickCard(this.foreignCustoms);
                expect(this.player2).toHavePrompt('Choose a character');
                this.player2.clickCard(this.chagatai);
                expect(this.chagatai.isDishonored).toBe(true);
                expect(this.chagatai.location).toBe('play area');
                expect(this.chagatai.isParticipating()).toBe(true);
                expect(this.getChatLogs(5)).toContain(
                    'player2 puts into the conflict Moto Chagatai - they challenge the traditions of the empire'
                );
            });

            it('should not react on a tie', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.player2).not.toHavePrompt('Triggered Abilities');
            });

            it('should not react if you win', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('2');

                expect(this.player2).not.toHavePrompt('Triggered Abilities');
            });
        });
    });
});
