describe('Golden Plains', function() {
    integration(function() {
        describe('Golden Plains Reaction', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['border-rider']
                    },
                    player2: {
                        inPlay: ['doji-whisperer'],
                        provinces: ['endless-plains', 'rally-to-the-cause', 'secret-cache', 'golden-plains']
                    }
                });
                this.endless = this.player2.findCardByName('endless-plains');
                this.rally = this.player2.findCardByName('rally-to-the-cause');
                this.cache = this.player2.findCardByName('secret-cache');
                this.plains = this.player2.findCardByName('golden-plains');
                this.shameful = this.player2.findCardByName('shameful-display', 'stronghold province');

                this.rider = this.player1.findCardByName('border-rider');
                this.whisperer = this.player2.findCardByName('doji-whisperer');
            });

            it('should react when a conflict is declared against it (facedown)', function() {
                this.plains.facedown = true;
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.plains
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.plains);
            });

            it('should react when a conflict is declared against it (faceup)', function() {
                this.plains.facedown = false;
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.plains
                });
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.plains);
            });

            it('should move the conflict', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    province: this.plains
                });
                this.player2.clickCard(this.plains);
                expect(this.player2).toBeAbleToSelect(this.endless);
                expect(this.player2).toBeAbleToSelect(this.cache);
                expect(this.player2).toBeAbleToSelect(this.rally);
                expect(this.player2).not.toBeAbleToSelect(this.plains);
                expect(this.player2).not.toBeAbleToSelect(this.shameful);

                this.player2.clickCard(this.endless);
                expect(this.game.currentConflict.conflictProvince).toBe(this.endless);
                expect(this.getChatLogs(5)).toContain('player2 uses Golden Plains to move the conflict to Endless Plains');
            });
        });

        describe('Golden Plains Passive - Different Stronghold', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['border-rider']
                    },
                    player2: {
                        inPlay: ['doji-whisperer'],
                        dynastyDiscard: ['doji-challenger'],
                        provinces: ['endless-plains', 'rally-to-the-cause', 'secret-cache', 'golden-plains'],
                        stronghold: ['hisu-mori-toride-unicorn']
                    }
                });
                this.endless = this.player2.findCardByName('endless-plains');
                this.rally = this.player2.findCardByName('rally-to-the-cause');
                this.cache = this.player2.findCardByName('secret-cache');
                this.plains = this.player2.findCardByName('golden-plains');
                this.shameful = this.player2.findCardByName('shameful-display', 'stronghold province');

                this.rider = this.player1.findCardByName('border-rider');
                this.whisperer = this.player2.findCardByName('doji-whisperer');
                this.challenger = this.player2.findCardByName('doji-challenger');

                this.plains.facedown = false;
                this.game.checkGameState(true);
            });

            it('should not grant cavalary', function() {
                expect(this.whisperer.hasTrait('cavalry')).toBe(false);
                expect(this.challenger.hasTrait('cavalry')).toBe(false);
            });
        });

        describe('Golden Plains Passive - GPO', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-kuwanan']
                    },
                    player2: {
                        inPlay: ['doji-whisperer'],
                        dynastyDiscard: ['doji-challenger'],
                        provinces: ['endless-plains', 'rally-to-the-cause', 'secret-cache', 'golden-plains'],
                        stronghold: ['golden-plains-outpost']
                    }
                });
                this.endless = this.player2.findCardByName('endless-plains');
                this.rally = this.player2.findCardByName('rally-to-the-cause');
                this.cache = this.player2.findCardByName('secret-cache');
                this.plains = this.player2.findCardByName('golden-plains');
                this.shameful = this.player2.findCardByName('shameful-display', 'stronghold province');

                this.kuwanan = this.player1.findCardByName('doji-kuwanan');
                this.whisperer = this.player2.findCardByName('doji-whisperer');
                this.challenger = this.player2.findCardByName('doji-challenger');

                this.plains.facedown = false;
                this.game.checkGameState(true);
            });

            it('should grant cavalary to characters in play', function() {
                expect(this.whisperer.hasTrait('cavalry')).toBe(true);
                expect(this.challenger.hasTrait('cavalry')).toBe(false);
                expect(this.kuwanan.hasTrait('cavalry')).toBe(false);
            });
        });
    });
});
