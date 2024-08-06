describe('Last Judgement Plains', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['aggressive-moto', 'worldly-shiotome']
                },
                player2: {
                    inPlay: ['togashi-initiate', 'doomed-shugenja', 'togashi-yokuni'],
                    provinces: ['last-judgment-plains']
                }
            });

            this.aggressiveMoto = this.player1.findCardByName('aggressive-moto');
            this.worldly = this.player1.findCardByName('worldly-shiotome');

            this.initiate = this.player2.findCardByName('togashi-initiate');
            this.doomedShugenja = this.player2.findCardByName('doomed-shugenja');
            this.yokuni = this.player2.findCardByName('togashi-yokuni');
            this.lastJudgementPlains = this.player2.findCardByName('last-judgment-plains', 'province 1');
        });

        it('moves fate around', function () {
            const initiateStartFate = 3;
            const yokuniStartFate = 1;
            this.initiate.fate = initiateStartFate;
            this.yokuni.fate = yokuniStartFate;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto],
                defenders: [this.yokuni],
                province: this.lastJudgementPlains
            });

            this.player2.clickCard(this.lastJudgementPlains);
            expect(this.player2).toHavePrompt('Choose a donor character');
            expect(this.player2).not.toBeAbleToSelect(this.aggressiveMoto);
            expect(this.player2).not.toBeAbleToSelect(this.worldly);
            expect(this.player2).not.toBeAbleToSelect(this.doomedShugenja);
            expect(this.player2).toBeAbleToSelect(this.initiate);
            expect(this.player2).toBeAbleToSelect(this.yokuni);

            this.player2.clickCard(this.initiate);
            expect(this.player2).toHavePrompt('Choose a recipient character');
            expect(this.player2).not.toBeAbleToSelect(this.aggressiveMoto);
            expect(this.player2).not.toBeAbleToSelect(this.worldly);
            expect(this.player2).toBeAbleToSelect(this.doomedShugenja);
            expect(this.player2).not.toBeAbleToSelect(this.initiate);
            expect(this.player2).toBeAbleToSelect(this.yokuni);

            this.player2.clickCard(this.yokuni);
            expect(this.player2).toHavePrompt('How much fate do you want to move?');
            expect(this.player2).toHavePromptButton('1');
            expect(this.player2).toHavePromptButton('2');
            expect(this.player2).toHavePromptButton('3');
            expect(this.player2).not.toHavePromptButton('4');

            this.player2.clickPrompt('2');
            expect(this.initiate.fate).toBe(initiateStartFate - 2);
            expect(this.yokuni.fate).toBe(yokuniStartFate + 2);

            expect(this.getChatLogs(3)).toContain(
                'player2 uses Last Judgment Plains to move fate from Togashi Initiate to Togashi Yokuni'
            );
        });
    });
});