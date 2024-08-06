describe('Shrewd Investigator', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shrewd-investigator', 'isawa-tadaka-2']
                },
                player2: {
                    hand: ['ornate-fan', 'fine-katana', 'banzai', 'assassination', 'let-go']
                }
            });

            this.investigator = this.player1.findCardByName('shrewd-investigator');
            this.isawaTadaka = this.player1.findCardByName('isawa-tadaka-2');

            this.p1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.pStronghold = this.player1.findCardByName('shameful-display', 'stronghold province');
        });

        it('should not trigger if not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: []
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.investigator);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should show you a number of randomly chosen cards in your opponent\'s hand equal to your facedown provinces', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.investigator],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.investigator);
            expect(this.getChatLogs(4)).toContain('player1 uses Shrewd Investigator to look at 5 random cards in player2\'s hand');
            expect(this.getChatLogs(4)).toContain('Shrewd Investigator sees Assassination, Banzai!, Fine Katana, Let Go and Ornate Fan');
        });

        it('should show you a number of randomly chosen cards in your opponent\'s hand equal to your facedown provinces - 3 facedown', function() {
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.investigator],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.investigator);
            expect(this.getChatLogs(4)).toContain('player1 uses Shrewd Investigator to look at 3 random cards in player2\'s hand');
            let matches = 0;
            if(this.getChatLog(2).includes('Assassination')) {
                matches++;
            }
            if(this.getChatLog(2).includes('Banzai!')) {
                matches++;
            }
            if(this.getChatLog(2).includes('Fine Katana')) {
                matches++;
            }
            if(this.getChatLog(2).includes('Let Go')) {
                matches++;
            }
            if(this.getChatLog(2).includes('Ornate Fan')) {
                matches++;
            }
            expect(matches).toBe(3);
        });

        it('should show you a number of randomly chosen cards in your opponent\'s hand equal to your facedown provinces - 1 facedown', function() {
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p3.facedown = false;
            this.p4.facedown = false;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.investigator],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.investigator);
            expect(this.getChatLogs(4)).toContain('player1 uses Shrewd Investigator to look at 1 random card in player2\'s hand');
            let matches = 0;
            if(this.getChatLog(2).includes('Assassination')) {
                matches++;
            }
            if(this.getChatLog(2).includes('Banzai!')) {
                matches++;
            }
            if(this.getChatLog(2).includes('Fine Katana')) {
                matches++;
            }
            if(this.getChatLog(2).includes('Let Go')) {
                matches++;
            }
            if(this.getChatLog(2).includes('Ornate Fan')) {
                matches++;
            }
            expect(matches).toBe(1);
        });

        it('should not trigger if no facedown provinces', function() {
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p3.facedown = false;
            this.p4.facedown = false;
            this.pStronghold.facedown = false;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.investigator],
                defenders: []
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.investigator);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

    });
});

