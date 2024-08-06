describe('Dispatch To Nowhere', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    inPlay: ['doji-challenger', 'doji-whisperer'],
                    dynastyDiscard: ['dispatch-to-nowhere', 'daidoji-uji']
                },
                player2: {
                    inPlay: ['yogo-hiroue', 'matsu-berserker']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.hiroue = this.player2.findCardByName('yogo-hiroue');
            this.berserker = this.player2.findCardByName('matsu-berserker');
            this.dispatch = this.player1.findCardByName('dispatch-to-nowhere');
            this.uji = this.player1.findCardByName('daidoji-uji');

            this.challenger.fate = 1;
            this.berserker.fate = 1;
            this.player1.placeCardInProvince(this.dispatch, 'province 1');
            this.player1.placeCardInProvince(this.uji, 'province 2');
        });

        it('should allow targeting a character with no fate', function() {
            this.player1.clickCard(this.dispatch);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.hiroue);
            expect(this.player1).not.toBeAbleToSelect(this.berserker);
            expect(this.player1).not.toBeAbleToSelect(this.uji);
        });

        it('should discard the character', function() {
            this.player1.clickCard(this.dispatch);
            this.player1.clickCard(this.hiroue);
            expect(this.hiroue.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(1)).toContain('player1 plays Dispatch to Nowhere to discard Yogo Hiroue');
        });
    });
});
