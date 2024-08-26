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

                this.greefKarga = this.player1.findCardByName('greef-karga#affable-commissioner');

                this.atst = this.player1.findCardByName('atst');
                this.battlefieldMarine = this.player1.findCardByName('battlefield-marine');
                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
                this.foundling = this.player1.findCardByName('foundling');
                this.pykeSentinel = this.player1.findCardByName('pyke-sentinel');

                this.noMoreActions();
            });

            it('can draw upgrade', function () {
                this.player1.clickCard(this.greefKarga);
                expect(this.player1).toHavePrompt('Select a card to reveal');
                expect(this.player1).toHavePromptButton(this.foundling.title);
                expect(this.player1).toHaveDisabledPromptButtons([this.atst.title, this.battlefieldMarine.title, this.cartelSpacer.title, this.pykeSentinel.title]);
                this.player1.clickPrompt(this.foundling.title);
                expect(this.foundling.location).toBe('hand');
                expect(this.getChatLogs(2)).toContain('player1 takes Foundling');
            });

            //TODO: do we need more tests?
        });
    });
});
