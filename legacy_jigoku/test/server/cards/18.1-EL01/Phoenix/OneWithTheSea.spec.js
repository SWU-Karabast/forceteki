describe('One With the Sea', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'draw',
                player1: {
                    inPlay: ['doji-challenger', 'doji-kuwanan'],
                    hand: ['one-with-the-sea'],
                    dynastyDiscard: ['secluded-shrine']
                },
                player2: {
                    inPlay: ['kakita-yoshi']
                }
            });

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.sea = this.player1.findCardByName('one-with-the-sea');
            this.shrine = this.player1.findCardByName('secluded-shrine');
            this.player1.placeCardInProvince(this.shrine, 'province 1');
            this.shrine.facedown = false;

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            this.noMoreActions();

            this.player1.clickCard(this.shrine);
            this.player1.clickRing('fire');
        });

        it('should not prompt you to choose an action if you don\'t have the water ring', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.sea);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.yoshi);

            this.player1.clickCard(this.kuwanan);
            expect(this.kuwanan.isParticipating()).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays One with the Sea to move Doji Kuwanan into the conflict');
        });

        it('should prompt you to choose an action if you have the water ring', function() {
            this.player1.claimRing('water');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.sea);
            let fate = this.player1.fate;
            expect(this.player1).toHavePrompt('One with the Sea');
            expect(this.player1).toHavePromptButton('Move a character you control to the conflict');
            expect(this.player1).toHavePromptButton('Move any character to the conflict');

            this.player1.clickPrompt('Move any character to the conflict');
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.yoshi);

            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.isParticipating()).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays One with the Sea, spending 1 fate to move Kakita Yoshi into the conflict');
            expect(this.player1.fate).toBe(fate - 1);
        });

        it('if you don\'t spend the fate', function() {
            this.player1.claimRing('water');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.sea);
            expect(this.player1).toHavePrompt('One with the Sea');
            expect(this.player1).toHavePromptButton('Move a character you control to the conflict');
            expect(this.player1).toHavePromptButton('Move any character to the conflict');

            this.player1.clickPrompt('Move a character you control to the conflict');
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.yoshi);
        });
    });
});
