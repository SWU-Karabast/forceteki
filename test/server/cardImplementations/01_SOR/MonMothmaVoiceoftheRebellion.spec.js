describe('Mon Mothma, Voice of the Rebellion', function() {
    integration(function() {
        describe('Mon Mothma\'s Ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mon-mothma#voice-of-the-rebellion'],
                        deck: ['cell-block-guard', 'pyke-sentinel', 'volunteer-soldier', 'cartel-spacer', 'battlefield-marine'],
                        deckSize: 5,
                        leader: ['leia-organa#alliance-general'],
                        resources: ['atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                    }
                });

                this.monMothma = this.player1.findCardByName('mon-mothma#voice-of-the-rebellion');
                this.battlefieldMarine = this.player1.findCardByName('battlefield-marine');

                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
                this.cellBlockGuard = this.player1.findCardByName('cell-block-guard');
                this.pykeSentinel = this.player1.findCardByName('pyke-sentinel');
                this.volunteerSoldier = this.player1.findCardByName('volunteer-soldier');

                this.noMoreActions();
            });

            it('should prompt to choose a Rebel from the top 5 cards', function () {
                this.player1.clickCard(this.monMothma);
                expect(this.monMothma.location).toBe('ground arena');
                expect(this.player1).toHavePrompt('Select a card to reveal');
                expect(this.player1).toHaveDisabledPromptButton('Cell Block Guard');
                expect(this.player1).toHaveDisabledPromptButton('Volunteer Soldier');
                expect(this.player1).toHaveDisabledPromptButton('Pyke Sentinel');
                expect(this.player1).toHaveDisabledPromptButton('Cartel Spacer');
                expect(this.player1).toHavePromptButton('Battlefield Marine');
            });

            it('should reveal the chosen Rebel', function() {
                this.player1.clickCard(this.monMothma);
                this.player1.clickPrompt('Battlefield Marine');
                expect(this.getChatLogs(2)).toContain('player1 takes Battlefield Marine');
            });

            it('should add the chosen card to your hand', function() {
                this.player1.clickCard(this.monMothma);
                this.player1.clickPrompt('Battlefield Marine');
                expect(this.battlefieldMarine.location).toBe('hand');
            });

            it('should place the remaining cards on the bottom of the deck', function() {
                this.player1.clickCard(this.monMothma);
                this.player1.clickPrompt('Battlefield Marine');
                expect(this.player1.deck.length).toBe(4);

                expect(this.cartelSpacer.location).toBe('deck');
                expect(this.cellBlockGuard.location).toBe('deck');
                expect(this.pykeSentinel.location).toBe('deck');
                expect(this.volunteerSoldier.location).toBe('deck');
            });
        });
    });
});
