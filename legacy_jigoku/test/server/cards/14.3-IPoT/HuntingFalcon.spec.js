describe('Hunting Falcon', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-whisperer', 'giver-of-gifts'],
                    hand: ['hunting-falcon'],
                    provinces: ['illustrious-forge']
                },
                player2: {
                    inPlay: ['callow-delegate'],
                    provinces: ['midnight-revels']
                }
            });

            this.falcon = this.player1.findCardByName('hunting-falcon');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.giver = this.player1.findCardByName('giver-of-gifts');
            this.callow = this.player2.findCardByName('callow-delegate');
            this.forge = this.player1.findCardByName('illustrious-forge');

            this.p1_1 = this.forge;
            this.p1_2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p1_3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_Stronghold = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.p2_1 = this.player2.findCardByName('midnight-revels');
            this.p2_2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p2_3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p2_4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.p2_4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.p2_Stronghold = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.p1_2.facedown = false;
            this.p1_3.facedown = false;
            this.p2_Stronghold.facedown = false;
        });

        it('should allow attaching on anyone', function() {
            this.player1.clickCard(this.falcon);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.giver);
            expect(this.player1).toBeAbleToSelect(this.callow);
        });

        it('should react on attaching to a character', function() {
            this.player1.clickCard(this.falcon);
            this.player1.clickCard(this.whisperer);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.falcon);
        });

        it('should let you choose a facedown province', function() {
            this.player1.clickCard(this.falcon);
            this.player1.clickCard(this.whisperer);
            this.player1.clickCard(this.falcon);
            expect(this.player1).toBeAbleToSelect(this.p1_1);
            expect(this.player1).not.toBeAbleToSelect(this.p1_2);
            expect(this.player1).not.toBeAbleToSelect(this.p1_3);
            expect(this.player1).toBeAbleToSelect(this.p1_4);
            expect(this.player1).toBeAbleToSelect(this.p1_Stronghold);

            expect(this.player1).toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).toBeAbleToSelect(this.p2_3);
            expect(this.player1).toBeAbleToSelect(this.p2_4);
            expect(this.player1).not.toBeAbleToSelect(this.p2_Stronghold);
        });

        it('should look at the chosen province', function() {
            this.player1.clickCard(this.falcon);
            this.player1.clickCard(this.whisperer);
            this.player1.clickCard(this.falcon);

            this.player1.clickCard(this.p2_1);
            expect(this.getChatLogs(10)).toContain('player1 uses Hunting Falcon to look at a facedown card');
            expect(this.getChatLogs(10)).toContain('Hunting Falcon sees Midnight Revels in province 1');
        });

        it('should work on opponent\'s characters', function() {
            this.player1.clickCard(this.falcon);
            this.player1.clickCard(this.callow);
            expect(this.player1).toHavePrompt('Triggered Abilities');
        });

        it('should not react when being moved', function() {
            this.player1.clickCard(this.falcon);
            this.player1.clickCard(this.giver);
            this.player1.pass();
            this.player2.pass();
            this.player1.clickCard(this.giver);
            this.player1.clickCard(this.falcon);
            this.player1.clickCard(this.whisperer);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should react when being put into play', function() {
            this.player1.reduceDeckToNumber('conflict', 0);
            this.player1.moveCard(this.falcon, 'conflict deck');

            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.callow],
                type: 'military',
                province: this.forge
            });

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.forge);
            this.player1.clickCard(this.forge);
            expect(this.player1).toHavePromptButton('Hunting Falcon');
            this.player1.clickPrompt('Hunting Falcon');
            this.player1.clickCard(this.whisperer);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.falcon);
            this.player1.clickCard(this.falcon);
            expect(this.player1).toHavePrompt('Hunting Falcon');
        });
    });
});
