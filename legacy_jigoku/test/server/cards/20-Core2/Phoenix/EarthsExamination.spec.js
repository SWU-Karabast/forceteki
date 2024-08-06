describe("Earth's Examination", function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['prodigy-of-the-waves', 'kaito-kosori', 'keeper-initiate']
                },
                player2: {
                    hand: ['earth-s-examination'],
                    inPlay: ['adept-of-the-waves', 'solemn-scholar']
                }
            });

            this.keeper = this.player1.findCardByName('keeper-initiate');
            this.prodigy = this.player1.findCardByName('prodigy-of-the-waves');
            this.kosoriTainted = this.player1.findCardByName('kaito-kosori');
            this.kosoriTainted.taint();

            this.examination = this.player2.findCardByName('earth-s-examination');
            this.adept = this.player2.findCardByName('adept-of-the-waves');
            this.solemn = this.player2.findCardByName('solemn-scholar');

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.prodigy, this.kosoriTainted],
                defenders: [this.adept],
                type: 'political'
            });
        });

        describe('without affinity', function () {
            beforeEach(function () {
                this.player2.moveCard(this.solemn, 'dynasty discard pile');
            });

            it('taints a participating character', function () {
                this.player2.clickCard(this.examination);
                expect(this.player2).toHavePrompt('Choose a character');
                expect(this.player2).toBeAbleToSelect(this.prodigy);
                expect(this.player2).not.toBeAbleToSelect(this.kosoriTainted);
                expect(this.player2).toBeAbleToSelect(this.adept);
                expect(this.player2).not.toBeAbleToSelect(this.keeper);

                this.player2.clickCard(this.prodigy);
                expect(this.player2).not.toHavePrompt('Bow that character?');
                expect(this.prodigy.isTainted).toBe(true);
                expect(this.getChatLogs(5)).toContain(
                    "player2 plays Earth's Examination to reveal Prodigy of the Waves's corruption"
                );
            });

            it('cannot be used on a tainted character', function () {
                this.prodigy.taint();
                this.player2.clickCard(this.prodigy);

                this.player2.clickCard(this.examination);
                expect(this.player2).toHavePrompt('Choose a character');
                expect(this.player2).not.toBeAbleToSelect(this.prodigy);
                expect(this.player2).not.toBeAbleToSelect(this.kosoriTainted);
                expect(this.player2).toBeAbleToSelect(this.adept);
                expect(this.player2).not.toBeAbleToSelect(this.keeper);
            });
        });
        describe('with affinity', function () {
            it('taints a participating character', function () {
                this.player2.clickCard(this.examination);
                expect(this.player2).toHavePrompt('Choose a character');
                expect(this.player2).toBeAbleToSelect(this.prodigy);
                expect(this.player2).toBeAbleToSelect(this.kosoriTainted);
                expect(this.player2).toBeAbleToSelect(this.adept);
                expect(this.player2).not.toBeAbleToSelect(this.keeper);
                expect(this.player2).not.toBeAbleToSelect(this.solemn);

                this.player2.clickCard(this.prodigy);
                expect(this.player2).toHavePrompt('Bow that character?');
                expect(this.player2).toHavePromptButton('Yes');
                expect(this.player2).toHavePromptButton('No');

                this.player2.clickPrompt('No');
                expect(this.prodigy.isTainted).toBe(true);
                expect(this.getChatLogs(5)).toContain(
                    "player2 plays Earth's Examination to reveal Prodigy of the Waves's corruption"
                );
            });

            it('taints and bow a participating character', function () {
                this.player2.clickCard(this.examination);
                this.player2.clickCard(this.prodigy);
                expect(this.player2).toHavePrompt('Bow that character?');
                expect(this.player2).toHavePromptButton('Yes');
                expect(this.player2).toHavePromptButton('No');

                this.player2.clickPrompt('Yes');
                expect(this.prodigy.bowed).toBe(true);
                expect(this.getChatLogs(5)).toContain(
                    'player2 channels their earth affinity to bow Prodigy of the Waves'
                );
            });

            it('bows a target that is already tainted', function () {
                this.prodigy.taint();

                this.player2.clickCard(this.examination);
                this.player2.clickCard(this.prodigy);
                expect(this.player2).not.toHavePrompt('Bow that character?');
                expect(this.prodigy.isTainted).toBe(true);
                expect(this.prodigy.bowed).toBe(true);
                expect(this.getChatLogs(5)).toContain(
                    "player2 plays Earth's Examination to reveal Prodigy of the Waves's corruption"
                );

                expect(this.getChatLogs(5)).toContain(
                    'player2 channels their earth affinity to bow Prodigy of the Waves'
                );
            });
        });
    });
});
