describe('The East Wind', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['cautious-scout'],
                    hand: [
                        'compass',
                        'fine-katana',
                        'adopted-kin',
                        'adorned-barcha',
                        'inscribed-tanto',
                        'child-of-saltless-water'
                    ],
                    stronghold: ['the-east-wind']
                },
                player2: {}
            });

            this.eastWind = this.player1.findCardByName('the-east-wind');
            this.childOfSaltlessWater = this.player1.findCardByName('child-of-saltless-water');
            this.compass = this.player1.findCardByName('compass');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.adoptedKin = this.player1.findCardByName('adopted-kin');
            this.adornedBarcha = this.player1.findCardByName('adorned-barcha');
            this.inscribedTanto = this.player1.findCardByName('inscribed-tanto');
            this.scout = this.player1.findCardByName('cautious-scout');

            this.player1.moveCard(this.adornedBarcha, 'conflict deck');
            this.player1.moveCard(this.inscribedTanto, 'conflict deck');
        });

        it('triggers for foreign cards', function () {
            this.player1.clickCard(this.compass);
            this.player1.clickCard(this.scout);
            expect(this.player1).toHavePrompt('Any reactions to Compass being played?');

            this.player1.clickCard(this.eastWind);
            expect(this.player1).toHavePrompt('Select a card to reveal');
        });

        it('does not trigger for neutral cards', function () {
            this.player1.clickCard(this.fineKatana);
            this.player1.clickCard(this.scout);
            expect(this.player1).not.toHavePrompt('Any reactions to Fine Katana being played?');
        });

        it('triggers for out-of-clan cards', function () {
            this.player1.clickCard(this.adoptedKin);
            this.player1.clickCard(this.scout);
            expect(this.player1).toHavePrompt('Any reactions to Adopted Kin being played?');

            this.player1.clickCard(this.eastWind);
            expect(this.player1).toHavePrompt('Select a card to reveal');
        });

        it('searchs for card with matching trait', function () {
            this.player1.clickCard(this.compass);
            this.player1.clickCard(this.scout);
            expect(this.player1).toHavePrompt('Any reactions to Compass being played?');

            this.player1.clickCard(this.eastWind);
            expect(this.player1).toHavePrompt('Select a card to reveal');
            expect(this.player1).toHavePromptButton('Adorned Barcha');
            expect(this.player1).not.toHavePromptButton('Inscribed Tantō');
            expect(this.player1).not.toHavePromptButton('Supernatural Storm (3)');
            expect(this.player1).toHavePromptButton('Take nothing');

            this.player1.clickPrompt('Adorned Barcha');
            expect(this.adornedBarcha.location).toBe('hand');
        });

        it('gains 1 fate when no match', function () {
            const initialFate = this.player1.fate;
            this.player1.clickCard(this.adoptedKin);
            this.player1.clickCard(this.scout);
            expect(this.player1).toHavePrompt('Any reactions to Adopted Kin being played?');

            this.player1.clickCard(this.eastWind);
            expect(this.player1).toHavePrompt('Select a card to reveal');
            expect(this.player1).not.toHavePromptButton('Adorned Barcha');
            expect(this.player1).not.toHavePromptButton('Inscribed Tantō');
            expect(this.player1).not.toHavePromptButton('Supernatural Storm (3)');
            expect(this.player1).toHavePromptButton('Take nothing');

            this.player1.clickPrompt('Take nothing');
            expect(this.player1.fate).toBe(initialFate + 1);
        });

        it('works when deck is too small', function () {
            const initialFate = this.player1.fate;
            this.player1.reduceDeckToNumber('conflict deck', 1);

            this.player1.clickCard(this.childOfSaltlessWater);
            this.player1.clickPrompt('0');
            expect(this.player1).toHavePrompt(
                'Any reactions to Child of Saltless Water leaving play, Child of Saltless Water being played or Child of Saltless Water entering play?'
            );

            this.player1.clickCard(this.eastWind);
            expect(this.player1).toHavePrompt('Select a card to reveal');

            this.player1.clickPrompt('Take nothing');
            expect(this.player1.fate).toBe(initialFate);
        });
    });
});