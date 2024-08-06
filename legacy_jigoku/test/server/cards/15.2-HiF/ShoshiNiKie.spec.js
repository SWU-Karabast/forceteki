describe('Shoshi Ni Kie', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['chronicler-of-conquests', 'ashigaru-levy', 'matsu-berserker'],
                    hand: ['shoshi-ni-kie'],
                    provinces: ['magistrate-station']
                },
                player2: {
                    inPlay: ['steward-of-cryptic-lore', 'miya-mystic']
                }
            });

            this.chronicler = this.player1.findCardByName('chronicler-of-conquests');
            this.matsu = this.player1.findCardByName('matsu-berserker');
            this.levy = this.player1.findCardByName('ashigaru-levy');

            this.magistrateStation = this.player1.findCardByName('magistrate-station');
            this.sd = this.player1.findCardByName('shameful-display', 'province 2');
            this.snk = this.player1.findCardByName('shoshi-ni-kie');

            this.steward = this.player2.findCardByName('steward-of-cryptic-lore');
            this.mystic = this.player2.findCardByName('miya-mystic');

            this.chronicler.honor();
            this.matsu.dishonor();
            this.steward.dishonor();
        });

        it('should not be able to target non-ordinary or standing characters', function () {
            this.chronicler.bow();
            this.levy.bow();
            this.steward.bow();
            this.mystic.bow();

            this.player1.clickCard(this.snk);

            expect(this.player1).toHavePrompt('Choose a character');

            expect(this.player1).not.toBeAbleToSelect(this.chronicler); //honored
            expect(this.player1).toBeAbleToSelect(this.levy); //ordinary
            expect(this.player1).not.toBeAbleToSelect(this.steward); //dishonored
            expect(this.player1).toBeAbleToSelect(this.mystic); //ordinary
            expect(this.player1).not.toBeAbleToSelect(this.matsu); //dishonored
        });

        it('should ask to reveal a province as a cost', function () {
            this.chronicler.bow();
            this.levy.bow();
            this.steward.bow();

            this.player1.clickCard(this.snk);

            expect(this.player1).toHavePrompt('Choose a character');

            this.player1.clickCard(this.levy); //ordinary
            expect(this.levy.bowed).toBe(true);

            expect(this.player1).toHavePrompt('Select a province to reveal');
            expect(this.player1).toBeAbleToSelect(this.magistrateStation);
            expect(this.player1).toBeAbleToSelect(this.sd);
        });

        it('should reveal the province and ready the character', function () {
            this.chronicler.bow();
            this.levy.bow();
            this.steward.bow();

            this.player1.clickCard(this.snk);

            expect(this.player1).toHavePrompt('Choose a character');

            this.player1.clickCard(this.levy); //ordinary
            expect(this.levy.bowed).toBe(true);

            expect(this.player1).toHavePrompt('Select a province to reveal');
            this.player1.clickCard(this.magistrateStation);

            expect(this.magistrateStation.facedown).toBe(false);
            expect(this.levy.bowed).toBe(false);

            expect(this.getChatLogs(2)).toContain('player1 plays Shoshi ni Kie, revealing Magistrate Station to ready Ashigaru Levy');
        });

        it('should not be able to target faceup provinces', function () {
            this.chronicler.bow();
            this.levy.bow();
            this.steward.bow();

            this.magistrateStation.facedown = false;
            this.player1.clickCard(this.snk);

            expect(this.player1).toHavePrompt('Choose a character');

            this.player1.clickCard(this.levy); //ordinary
            expect(this.levy.bowed).toBe(true);

            expect(this.player1).toHavePrompt('Select a province to reveal');
            this.player1.clickCard(this.magistrateStation);
            expect(this.player1).not.toBeAbleToSelect(this.magistrateStation);
        });
    });
});
