describe('Guardian Dojo', function () {
    integration(function () {
        describe('when playing characters', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        dynastyDiscard: ['doji-challenger', 'shiba-tsukune', 'guardian-dojo', 'ikoma-orator', 'moto-youth']
                    }
                });

                this.tsukune = this.player1.placeCardInProvince('shiba-tsukune', 'province 1');
                this.challenger = this.player1.placeCardInProvince('doji-challenger', 'province 2');
                this.guardianDojo = this.player1.moveCard('guardian-dojo', 'province 2');
                this.orator = this.player1.placeCardInProvince('ikoma-orator', 'province 3');
                this.youth = this.player1.placeCardInProvince('moto-youth', 'province 4');
            });

            it('should honor characters played from adjacent provinces and you may put no fate on them', function () {
                this.player1.clickCard(this.tsukune);

                expect(this.player1).toHavePromptButton('0');
                expect(this.player1).not.toHavePromptButton('1');
                expect(this.player1).not.toHavePromptButton('2');
                this.player1.clickPrompt('0');
                expect(this.tsukune.location).toBe('play area');
                expect(this.tsukune.isHonored).toBe(true);
                expect(this.tsukune.fate).toBe(0);
            });

            it('should not honor characters played from non-adjacent provinces and you may put fate on them', function () {
                this.player1.clickCard(this.youth);

                expect(this.player1).toHavePromptButton('0');
                expect(this.player1).toHavePromptButton('1');
                expect(this.player1).toHavePromptButton('2');
                this.player1.clickPrompt('1');
                expect(this.youth.location).toBe('play area');
                expect(this.youth.isHonored).toBe(false);
                expect(this.youth.fate).toBe(1);
            });

            it('should not honor characters played from Guardian Dojo province and you may put fate on them', function () {
                this.player1.clickCard(this.challenger);

                expect(this.player1).toHavePromptButton('0');
                expect(this.player1).toHavePromptButton('1');
                expect(this.player1).toHavePromptButton('2');
                this.player1.clickPrompt('2');
                expect(this.challenger.location).toBe('play area');
                expect(this.challenger.isHonored).toBe(false);
                expect(this.challenger.fate).toBe(2);
            });
        });
        describe('when putting characters into play from adjacent province', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['moto-youth'],
                        hand: ['charge'],
                        dynastyDiscard: ['doji-challenger', 'shiba-tsukune', 'guardian-dojo', 'ikoma-orator']
                    }
                });

                this.tsukune = this.player1.placeCardInProvince('shiba-tsukune', 'province 1');
                this.challenger = this.player1.placeCardInProvince('doji-challenger', 'province 2');
                this.guardianDojo = this.player1.moveCard('guardian-dojo', 'province 2');
                this.orator = this.player1.placeCardInProvince('ikoma-orator', 'province 3');
                this.youth = this.player1.findCardByName('moto-youth');
                this.charge = this.player1.findCardByName('charge');
            });

            it('should not honor a character.', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.youth],
                    defenders: []
                });

                this.player2.pass();
                this.player1.clickCard(this.charge);
                this.player1.clickCard(this.tsukune);

                expect(this.tsukune.isHonored).toBe(false);
                expect(this.tsukune.location).toBe('play area');
            });
        });
    });
});
