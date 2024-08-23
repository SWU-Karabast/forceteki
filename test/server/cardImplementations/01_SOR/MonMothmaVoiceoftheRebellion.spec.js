describe('Mon Mothma, Voice of the Rebellion', function() {
    integration(function() {
        describe('Mon Mothma\'s Ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mon-mothma#voice-of-the-rebellion'],
                        deck: ['cell-block-guard', 'pyke-sentinel', 'volunteer-soldier', 'cartel-spacer', 'battlefield-marine', 'wampa', 'viper-probe-droid', 'snowtrooper-lieutenant'],
                        deckSize: 8,
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
                expect(this.player1).toHaveDisabledPromptButton(this.cellBlockGuard.title);
                expect(this.player1).toHaveDisabledPromptButton(this.volunteerSoldier.title);
                expect(this.player1).toHaveDisabledPromptButton(this.pykeSentinel.title);
                expect(this.player1).toHaveDisabledPromptButton(this.cartelSpacer.title);
                expect(this.player1).toHavePromptButton(this.battlefieldMarine.title);
                expect(this.player1).toHavePromptButton('Take nothing');
            });

            it('should reveal the chosen Rebel', function() {
                this.player1.clickCard(this.monMothma);
                this.player1.clickPrompt(this.battlefieldMarine.title);
                expect(this.getChatLogs(2)).toContain('player1 takes Battlefield Marine');
            });

            it('should add the chosen card to your hand', function() {
                this.player1.clickCard(this.monMothma);
                this.player1.clickPrompt(this.battlefieldMarine.title);
                expect(this.battlefieldMarine.location).toBe('hand');
            });

            it('should be allowed to choose nothing and place all cards on the bottom of the deck', function() {
                this.player1.clickCard(this.monMothma);
                this.player1.clickPrompt('Take nothing');

                expect(this.battlefieldMarine).toBeInBottomOfDeck(this.player1, 5);
                expect(this.cartelSpacer).toBeInBottomOfDeck(this.player1, 5);
                expect(this.cellBlockGuard).toBeInBottomOfDeck(this.player1, 5);
                expect(this.pykeSentinel).toBeInBottomOfDeck(this.player1, 5);
                expect(this.volunteerSoldier).toBeInBottomOfDeck(this.player1, 5);
            });

            it('should place the remaining cards on the bottom of the deck', function() {
                this.player1.clickCard(this.monMothma);
                this.player1.clickPrompt(this.battlefieldMarine.title);

                expect(this.cartelSpacer).toBeInBottomOfDeck(this.player1, 4);
                expect(this.cellBlockGuard).toBeInBottomOfDeck(this.player1, 4);
                expect(this.pykeSentinel).toBeInBottomOfDeck(this.player1, 4);
                expect(this.volunteerSoldier).toBeInBottomOfDeck(this.player1, 4);
            });
        });
    });
});
