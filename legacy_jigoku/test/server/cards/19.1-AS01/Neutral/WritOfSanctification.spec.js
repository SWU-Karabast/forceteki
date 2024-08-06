describe('Writ of Sanctification', function () {
    integration(function () {
        describe('play restriction', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja', 'ikoma-message-runner'],
                        hand: ['writ-of-sanctification']
                    }
                });

                this.doomedShugenja = this.player1.findCardByName('doomed-shugenja');
                this.messageRunner = this.player1.findCardByName('ikoma-message-runner');
                this.writOfSanctification = this.player1.findCardByName('writ-of-sanctification');
            });

            it('should only be able to be played on a shugenja', function () {
                this.player1.clickCard(this.writOfSanctification);
                expect(this.player1).toHavePrompt('Choose a card');
                this.player1.clickCard(this.messageRunner);
                expect(this.player1).toHavePrompt('Choose a card');

                this.player1.clickCard(this.doomedShugenja);
                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Writ of Sanctification, attaching it to Doomed Shugenja'
                );
            });
        });

        describe('ancestral keyword', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja', 'ikoma-message-runner'],
                        hand: ['writ-of-sanctification', 'goblin-sneak', 'obsidian-talisman', 'jealous-ancestor']
                    }
                });

                this.doomedShugenja = this.player1.findCardByName('doomed-shugenja');
                this.messageRunner = this.player1.findCardByName('ikoma-message-runner');
                this.writOfSanctification = this.player1.findCardByName('writ-of-sanctification');
                this.obsidianTalisman = this.player1.findCardByName('obsidian-talisman');
                this.goblinSneak = this.player1.findCardByName('goblin-sneak');
                this.jealousAncestor = this.player1.findCardByName('jealous-ancestor');
            });

            it('should only have ancestral while you dont control a shadowlands character', function () {
                this.player1.clickCard(this.writOfSanctification);
                this.player1.clickCard(this.doomedShugenja);

                expect(this.writOfSanctification.hasKeyword('ancestral')).toBe(true);
                this.player2.pass();

                this.player1.clickCard(this.obsidianTalisman);
                this.player1.clickCard(this.doomedShugenja);

                expect(this.writOfSanctification.hasKeyword('ancestral')).toBe(true);
                this.player2.pass();

                this.player1.clickCard(this.goblinSneak);
                this.player1.clickPrompt('0');
                expect(this.writOfSanctification.hasKeyword('ancestral')).toBe(false);
            });
        });

        describe('gained action ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doomed-shugenja', 'ikoma-message-runner'],
                        hand: ['writ-of-sanctification']
                    },
                    player2: {
                        inPlay: ['goblin-sneak', 'jealous-ancestor']
                    }
                });

                this.doomedShugenja = this.player1.findCardByName('doomed-shugenja');
                this.messageRunner = this.player1.findCardByName('ikoma-message-runner');
                this.writOfSanctification = this.player1.findCardByName('writ-of-sanctification');

                this.goblinSneak = this.player2.findCardByName('goblin-sneak');
                this.jealousAncestor = this.player2.findCardByName('jealous-ancestor');
            });

            it('should not work outside a conflict', function () {
                this.player1.clickCard(this.writOfSanctification);
                this.player1.clickCard(this.doomedShugenja);

                this.player2.pass();

                this.player1.clickCard(this.doomedShugenja);

                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should not work when the bearer isnt participating', function () {
                this.player1.clickCard(this.writOfSanctification);
                this.player1.clickCard(this.doomedShugenja);

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.messageRunner],
                    defenders: [this.goblinSneak],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.doomedShugenja);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should not work when the corrupt character arent participating', function () {
                this.player1.clickCard(this.writOfSanctification);
                this.player1.clickCard(this.doomedShugenja);

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.doomedShugenja],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.doomedShugenja);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should be able to target a tainted or shadowlands participating character', function () {
                this.player1.clickCard(this.writOfSanctification);
                this.player1.clickCard(this.doomedShugenja);
                this.messageRunner.taint();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.doomedShugenja, this.messageRunner],
                    defenders: [this.jealousAncestor, this.goblinSneak],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.doomedShugenja);
                expect(this.player1).toBeAbleToSelect(this.goblinSneak);
                expect(this.player1).toBeAbleToSelect(this.jealousAncestor);
                expect(this.player1).toBeAbleToSelect(this.messageRunner);
            });
        });
    });
});
