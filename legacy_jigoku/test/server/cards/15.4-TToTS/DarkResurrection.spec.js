describe('Dark Resurrection', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['border-rider'],
                    hand: ['dark-resurrection'],
                    dynastyDiscard: ['vice-proprietor', 'ikoma-tsanuri', 'kitsu-motso', 'ikoma-ujiaki'],
                    conflictDiscard: ['ageless-crone']
                },
                player2: {
                }
            });

            this.borderRider = this.player1.findCardByName('border-rider');
            this.borderRider.fate = 3;

            this.dark = this.player1.findCardByName('dark-resurrection');

            this.vice = this.player1.findCardByName('vice-proprietor');
            this.tsanuri = this.player1.findCardByName('ikoma-tsanuri');
            this.motso = this.player1.findCardByName('kitsu-motso');
            this.ujiaki = this.player1.findCardByName('ikoma-ujiaki');
            this.crone = this.player1.findCardByName('ageless-crone');
        });

        it('should not work outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.dark);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not work in a pol conflict', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [],
                type: 'political'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.dark);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should allow targeting characters that costs 3 or less in your dynasty discard pile', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.dark);
            // this.player1.clickCard(this.borderRider);
            // this.player1.clickPrompt('3');
            expect(this.player1).toBeAbleToSelect(this.vice);
            expect(this.player1).toBeAbleToSelect(this.tsanuri);
            expect(this.player1).toBeAbleToSelect(this.motso);
            expect(this.player1).not.toBeAbleToSelect(this.ujiaki);
            expect(this.player1).not.toBeAbleToSelect(this.crone);
        });

        it('should put characters into the conflict dishonored', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.dark);
            expect(this.player1).toHavePrompt('Choose up to three characters');
            this.player1.clickCard(this.tsanuri);
            this.player1.clickCard(this.motso);
            this.player1.clickCard(this.vice);
            this.player1.clickPrompt('Done');
            this.player1.clickCard(this.borderRider);
            this.player1.clickPrompt('3');

            expect(this.tsanuri.location).toBe('play area');
            expect(this.motso.location).toBe('play area');
            expect(this.vice.location).toBe('play area');

            expect(this.tsanuri.isDishonored).toBe(true);
            expect(this.vice.isDishonored).toBe(true);
            expect(this.motso.isDishonored).toBe(true);
        });

        it('chat messages', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.dark);
            expect(this.player1).toHavePrompt('Choose up to three characters');
            this.player1.clickCard(this.tsanuri);
            this.player1.clickCard(this.motso);
            this.player1.clickCard(this.vice);
            this.player1.clickPrompt('Done');
            this.player1.clickCard(this.borderRider);
            this.player1.clickPrompt('3');

            expect(this.getChatLogs(6)).toContain('player1 plays Dark Resurrection to put Ikoma Tsanuri, Kitsu Motso and Vice Proprietor into play in the conflict');
        });

    });
});
