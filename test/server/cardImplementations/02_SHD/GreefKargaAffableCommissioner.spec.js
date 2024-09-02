describe('Greef Karga, Affable Commissioner', function() {
    integration(function() {
        describe('Greef Karga\'s Ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['greef-karga#affable-commissioner'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine']
                    }
                });
            });

            it('can draw upgrade', function () {
                this.player1.clickCard(this.greefKarga);
                expect(this.player1).toHavePrompt('Select a card to reveal');
                expect(this.player1).toHaveEnabledPromptButton(this.foundling.title);
                expect(this.player1).toHaveDisabledPromptButtons([this.atst.title, this.battlefieldMarine.title, this.cartelSpacer.title, this.pykeSentinel.title]);
                this.player1.clickPrompt(this.foundling.title);
                expect(this.foundling).toBeInLocation('hand');
                expect(this.getChatLogs(2)).toContain('player1 takes Foundling');
            });
        });
    });
});
