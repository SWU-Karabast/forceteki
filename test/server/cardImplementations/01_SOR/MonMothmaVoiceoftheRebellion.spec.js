describe('Mon Mothma, Voice of the Rebellion', function() {
    integration(function() {
        describe('Mon Mothma\'s Ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mon-mothma#voice-of-the-rebellion'],
                        deck: ['wampa', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine'],
                        leader: ['leia-organa#alliance-general']
                    }
                });

                this.monMothma = this.player1.findCardByName('mon-mothma#voice-of-the-rebellion');
                this.battlefieldMarine = this.player1.findCardByName('battlefield-marine');

                this.noMoreActions();
            });

            it('can draw rebel', function () {
                this.player1.clickCard(this.monMothma);
                expect(this.player1).toHavePrompt('Select a card to reveal');
                expect(this.player1).toHaveDisabledPromptButton('wampa');
                expect(this.player1).toHaveDisabledPromptButton('atst');
                expect(this.player1).toHaveDisabledPromptButton('pyke-sentinel');
                expect(this.player1).toHaveDisabledPromptButton('cartel-spacer');
                expect(this.player1).toHavePrompt('battlefield-marine');
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.battlefieldMarine.location).toBe('hand');
                expect(this.getChatLogs(2)).toContain('player1 takes Battlefield Marine');
            });
        });
    });
});
