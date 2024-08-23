describe('Mon Mothma, Voice of the Rebellion', function() {
    integration(function() {
        describe('Mon Mothma\'s Ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mon-mothma#voice-of-the-rebellion'],
                        deck: ['cell-block-guard', 'pyke-sentinel', 'atst', 'cartel-spacer', 'battlefield-marine'],
                        leader: ['leia-organa#alliance-general'],
                        resources: ['atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                    }
                });

                this.monMothma = this.player1.findCardByName('mon-mothma#voice-of-the-rebellion');
                this.battlefieldMarine = this.player1.findCardByName('battlefield-marine');

                this.noMoreActions();
            });

            it('can draw rebel', function () {
                this.player1.clickCard(this.monMothma);
                expect(this.monMothma.location).toBe('ground arena');
                expect(this.player1).toHavePrompt('Select a card to reveal');
                expect(this.player1).toHaveDisabledPromptButton('Wampa');
                expect(this.player1).toHaveDisabledPromptButton('AT-ST');
                expect(this.player1).toHaveDisabledPromptButton('Pyke Sentinel');
                expect(this.player1).toHaveDisabledPromptButton('Cartel Spacer');
                expect(this.player1).toHavePromptButton('Battlefield Marine');
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.battlefieldMarine.location).toBe('hand');
                expect(this.getChatLogs(2)).toContain('player1 takes Battlefield Marine');
            });
        });
    });
});
