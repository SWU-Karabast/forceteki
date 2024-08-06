describe('Cloud Step Valley', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['aggressive-moto', 'worldly-shiotome', 'utaku-tetsuko']
                },
                player2: {
                    inPlay: ['togashi-initiate', 'togashi-yokuni', 'doomed-shugenja'],
                    provinces: ['cloud-step-valley']
                }
            });

            this.aggressiveMoto = this.player1.findCardByName('aggressive-moto');
            this.wordlyShiotome = this.player1.findCardByName('worldly-shiotome');
            this.tetsuko = this.player1.findCardByName('utaku-tetsuko');

            this.initiate = this.player2.findCardByName('togashi-initiate');
            this.yokuni = this.player2.findCardByName('togashi-yokuni');
            this.doomedShugenja = this.player2.findCardByName('doomed-shugenja');

            this.cloudStepValley = this.player2.findCardByName('cloud-step-valley', 'province 1');
        });

        it("switches the location of opponent's characters", function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto],
                defenders: [this.yokuni],
                province: this.cloudStepValley
            });

            this.player2.clickCard(this.cloudStepValley);
            expect(this.player2).toHavePrompt('Choose a participating character to send home');
            expect(this.player2).toBeAbleToSelect(this.aggressiveMoto);
            expect(this.player2).not.toBeAbleToSelect(this.wordlyShiotome);
            expect(this.player2).not.toBeAbleToSelect(this.tetsuko);
            expect(this.player2).toBeAbleToSelect(this.yokuni);
            expect(this.player2).not.toBeAbleToSelect(this.initiate);
            expect(this.player2).not.toBeAbleToSelect(this.doomedShugenja);

            this.player2.clickCard(this.aggressiveMoto);
            expect(this.player1).toHavePrompt('Choose a character to move to the conflict');
            expect(this.player1).not.toBeAbleToSelect(this.aggressiveMoto);
            expect(this.player1).toBeAbleToSelect(this.wordlyShiotome);
            expect(this.player1).toBeAbleToSelect(this.tetsuko);
            expect(this.player1).not.toBeAbleToSelect(this.yokuni);
            expect(this.player1).not.toBeAbleToSelect(this.initiate);
            expect(this.player1).not.toBeAbleToSelect(this.doomedShugenja);

            this.player1.clickCard(this.tetsuko);
            expect(this.getChatLogs(3)).toContain(
                'player2 uses Cloud Step Valley to move Aggressive Moto home, and move Utaku Tetsuko to the conflict'
            );
        });

        it('switches the location of own characters', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto],
                defenders: [this.yokuni],
                province: this.cloudStepValley
            });

            this.player2.clickCard(this.cloudStepValley);
            expect(this.player2).toHavePrompt('Choose a participating character to send home');
            expect(this.player2).toBeAbleToSelect(this.aggressiveMoto);
            expect(this.player2).not.toBeAbleToSelect(this.wordlyShiotome);
            expect(this.player2).not.toBeAbleToSelect(this.tetsuko);
            expect(this.player2).toBeAbleToSelect(this.yokuni);
            expect(this.player2).not.toBeAbleToSelect(this.initiate);
            expect(this.player2).not.toBeAbleToSelect(this.doomedShugenja);

            this.player2.clickCard(this.yokuni);
            expect(this.player2).toHavePrompt('Choose a character to move to the conflict');
            expect(this.player2).not.toBeAbleToSelect(this.aggressiveMoto);
            expect(this.player2).not.toBeAbleToSelect(this.wordlyShiotome);
            expect(this.player2).not.toBeAbleToSelect(this.tetsuko);
            expect(this.player2).not.toBeAbleToSelect(this.yokuni);
            expect(this.player2).toBeAbleToSelect(this.initiate);
            expect(this.player2).toBeAbleToSelect(this.doomedShugenja);

            this.player2.clickCard(this.doomedShugenja);
            expect(this.getChatLogs(3)).toContain(
                'player2 uses Cloud Step Valley to move Togashi Yokuni home, and move Doomed Shugenja to the conflict'
            );
        });
    });
});