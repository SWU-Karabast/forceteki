describe('Doji Diplomat', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    dynastyDiscard: ['doji-diplomat']
                },
                player2: {
                    dynastyDiscard: ['doji-diplomat']
                }
            });

            this.diplomat = this.player1.placeCardInProvince('doji-diplomat', 'province 1');
            this.diplomat2 = this.player2.placeCardInProvince('doji-diplomat', 'province 1');

            this.p1_1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p1_2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p1_3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_Stronghold = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.p2_1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.p2_2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p2_3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p2_4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.p2_4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.p2_Stronghold = this.player2.findCardByName('shameful-display', 'stronghold province');
        });

        it('should react to being played', function() {
            this.player1.clickCard(this.diplomat);
            this.player1.clickPrompt('0');
            expect(this.player1).toHavePrompt('Triggered Abilities');
        });

        it('should not react if you have no facedown provinces', function() {
            this.p1_1.facedown = false;
            this.p1_2.facedown = false;
            this.p1_3.facedown = false;
            this.p1_4.facedown = false;
            this.p1_Stronghold.facedown = false;

            this.player1.clickCard(this.diplomat);
            this.player1.clickPrompt('0');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not react if your opponent has no facedown provinces', function() {
            this.p2_1.facedown = false;
            this.p2_2.facedown = false;
            this.p2_3.facedown = false;
            this.p2_4.facedown = false;
            this.p2_Stronghold.facedown = false;

            this.player1.clickCard(this.diplomat);
            this.player1.clickPrompt('0');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should let each player choose a facedown province', function() {
            this.p1_1.facedown = false;
            this.p1_2.facedown = false;
            this.p2_3.facedown = false;
            this.p2_4.facedown = false;

            this.player1.clickCard(this.diplomat);
            this.player1.clickPrompt('0');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.diplomat);
            expect(this.player1).toHavePrompt('Choose a province');
            expect(this.player1).not.toBeAbleToSelect(this.p1_1);
            expect(this.player1).not.toBeAbleToSelect(this.p1_2);
            expect(this.player1).not.toBeAbleToSelect(this.p1_3);
            expect(this.player1).not.toBeAbleToSelect(this.p1_4);
            expect(this.player1).not.toBeAbleToSelect(this.p1_Stronghold);

            expect(this.player1).toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).not.toBeAbleToSelect(this.p2_3);
            expect(this.player1).not.toBeAbleToSelect(this.p2_4);
            expect(this.player1).toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_1);

            expect(this.player2).toHavePrompt('Choose a province');

            expect(this.player2).not.toBeAbleToSelect(this.p1_1);
            expect(this.player2).not.toBeAbleToSelect(this.p1_2);
            expect(this.player2).toBeAbleToSelect(this.p1_3);
            expect(this.player2).toBeAbleToSelect(this.p1_4);
            expect(this.player2).toBeAbleToSelect(this.p1_Stronghold);

            expect(this.player2).not.toBeAbleToSelect(this.p2_1);
            expect(this.player2).not.toBeAbleToSelect(this.p2_2);
            expect(this.player2).not.toBeAbleToSelect(this.p2_3);
            expect(this.player2).not.toBeAbleToSelect(this.p2_4);
            expect(this.player2).not.toBeAbleToSelect(this.p2_Stronghold);

            this.player2.clickCard(this.p1_Stronghold);

            expect(this.p2_1.facedown).toBe(false);
            expect(this.p1_Stronghold.facedown).toBe(false);
        });

        it('chat messages', function() {
            this.player1.clickCard(this.diplomat);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.diplomat);
            this.player1.clickCard(this.p2_1);
            this.player2.clickCard(this.p1_Stronghold);

            expect(this.getChatLogs(3)).toContain('player1 uses Doji Diplomat to reveal Shameful Display and Shameful Display');
        });
    });
});
