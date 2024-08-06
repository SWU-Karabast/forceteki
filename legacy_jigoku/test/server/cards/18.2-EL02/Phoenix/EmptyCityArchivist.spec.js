describe('Empty City Archivist', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['isawa-atsuko', 'solemn-scholar', 'isawa-tadaka', 'seppun-ishikawa'],
                    hand: ['empty-city-archivist', 'empty-city-archivist', 'empty-city-archivist'],
                    conflictDiscard: ['embrace-the-void', 'hurricane-punch', 'display-of-power', 'way-of-the-scorpion', 'isawa-tadaka-2', 'all-and-nothing', 'censure']
                },
                player2: {
                }
            });

            this.ishikawa = this.player1.findCardByName('seppun-ishikawa');
            this.atsuko = this.player1.findCardByName('isawa-atsuko');
            this.scholar = this.player1.findCardByName('solemn-scholar');
            this.tadaka = this.player1.findCardByName('isawa-tadaka');
            this.scroll1 = this.player1.filterCardsByName('empty-city-archivist')[0];
            this.scroll2 = this.player1.filterCardsByName('empty-city-archivist')[1];
            this.scroll3 = this.player1.filterCardsByName('empty-city-archivist')[2];

            this.etv = this.player1.findCardByName('embrace-the-void');
            this.punch = this.player1.findCardByName('hurricane-punch');
            this.dop = this.player1.findCardByName('display-of-power');
            this.tadaka2 = this.player1.findCardByName('isawa-tadaka-2');
            this.scorp = this.player1.findCardByName('way-of-the-scorpion');
            this.aan = this.player1.findCardByName('all-and-nothing');
            this.censure = this.player1.findCardByName('censure');

            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.player1.moveCard(this.tadaka2, 'conflict deck');
            this.player1.moveCard(this.punch, 'conflict deck');
            this.player1.moveCard(this.dop, 'conflict deck');
            this.player1.moveCard(this.censure, 'conflict deck');
        });

        it('should let you pick a spell or kiho card from your deck', function () {
            this.player1.playAttachment(this.scroll1, this.atsuko);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.scroll1);
            this.player1.clickCard(this.scroll1);
            expect(this.player1).toHaveDisabledPromptButton('Isawa Tadaka');
            expect(this.player1).toHavePromptButton('Hurricane Punch');
            expect(this.player1).toHavePromptButton('Display of Power');
            expect(this.player1).toHaveDisabledPromptButton('Censure');
            this.player1.clickPrompt('Display of Power');
            expect(this.dop.location).toBe('hand');
            expect(this.getChatLogs(5)).toContain('player1 uses Empty City Archivist to look at the top 4 cards of their deck');
            expect(this.getChatLogs(5)).toContain('player1 takes Display of Power');
            expect(this.getChatLogs(5)).toContain('player1 puts 3 cards on the bottom of their conflict deck');
        });

        it('should let you pick anything if attached character is a scholar', function () {
            this.player1.playAttachment(this.scroll1, this.scholar);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.scroll1);
            this.player1.clickCard(this.scroll1);
            expect(this.player1).toHavePromptButton('Isawa Tadaka');
            expect(this.player1).toHavePromptButton('Hurricane Punch');
            expect(this.player1).toHavePromptButton('Display of Power');
            expect(this.player1).toHavePromptButton('Censure');
            this.player1.clickPrompt('Isawa Tadaka');
            expect(this.tadaka2.location).toBe('hand');
            expect(this.getChatLogs(5)).toContain('player1 uses Empty City Archivist to look at the top 4 cards of their deck');
            expect(this.getChatLogs(5)).toContain('player1 takes Isawa Tadaka');
            expect(this.getChatLogs(5)).toContain('player1 puts 3 cards on the bottom of their conflict deck');
        });
    });
});
