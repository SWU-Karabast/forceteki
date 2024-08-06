describe('Magistrate\'s Intervention', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger'],
                    hand: ['magistrate-s-intervention'],
                    dynastyDiscard: ['young-rumormonger', 'doji-whisperer'],
                    conflictDiscard: ['cunning-magistrate']
                },
                player2: {
                    inPlay: ['akodo-toturi','matsu-berserker']
                }
            });
            this.intervention = this.player1.findCardByName('magistrate-s-intervention');
            this.rumor = this.player1.findCardByName('young-rumormonger');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.cunning = this.player1.findCardByName('cunning-magistrate');
            this.challenger = this.player1.findCardByName('doji-challenger');

            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.zerk = this.player2.findCardByName('matsu-berserker');
            this.toturi.honor();
        });

        it('should not be able to be used outside of a conflict', function() {
            this.player1.moveCard(this.rumor, 'play area');
            this.player1.clickCard(this.intervention);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not be able to be used without a courtier', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: [],
                type: 'military'
            });
            this.player1.clickCard(this.intervention);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should be able to be used with a courtier', function() {
            this.noMoreActions();
            this.player1.moveCard(this.whisperer, 'play area');
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: [],
                type: 'military'
            });
            this.player1.clickCard(this.intervention);
            expect(this.player1).toHavePrompt('Magistrate\'s Intervention');
        });

        it('should be able to be used with a magistrate', function() {
            this.noMoreActions();
            this.player1.moveCard(this.cunning, 'play area');
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: [],
                type: 'military'
            });
            this.player1.clickCard(this.intervention);
            expect(this.player1).toHavePrompt('Magistrate\'s Intervention');
        });

        it('should allow you to targt an attacking character', function() {
            this.noMoreActions();
            this.player1.moveCard(this.cunning, 'play area');
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: [this.cunning],
                type: 'military'
            });
            this.player1.clickCard(this.intervention);
            expect(this.player1).toBeAbleToSelect(this.toturi);
            expect(this.player1).not.toBeAbleToSelect(this.zerk);
            expect(this.player1).not.toBeAbleToSelect(this.cunning);
        });

        it('should dishonor the target', function() {
            this.noMoreActions();
            this.player1.moveCard(this.cunning, 'play area');
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: [this.cunning],
                type: 'military'
            });
            this.player1.clickCard(this.intervention);
            this.player1.clickCard(this.toturi);
            expect(this.toturi.isHonored).toBe(false);
            expect(this.toturi.isDishonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Magistrate\'s Intervention to dishonor Akodo Toturi');
        });

        it('should dishonor the target twice if it is their second conflict against you', function() {
            this.noMoreActions();
            this.player1.moveCard(this.cunning, 'play area');
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: [this.cunning],
                type: 'military'
            });
            this.toturi.bowed = true;
            this.noMoreActions();
            this.toturi.bowed = false;
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: [],
                type: 'political',
                ring: 'earth'
            });

            this.player1.clickCard(this.intervention);
            this.player1.clickCard(this.toturi);
            expect(this.toturi.isHonored).toBe(false);
            expect(this.toturi.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Magistrate\'s Intervention to dishonor Akodo Toturi, then dishonor it again');
        });

        it('should not count your conflicts (1 conflict)', function() {
            this.noMoreActions();
            this.player1.moveCard(this.cunning, 'play area');
            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [],
                type: 'military'
            });
            this.cunning.bowed = true;
            this.noMoreActions();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: [],
                type: 'military'
            });

            this.player1.clickCard(this.intervention);
            this.player1.clickCard(this.toturi);
            expect(this.toturi.isHonored).toBe(false);
            expect(this.toturi.isDishonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Magistrate\'s Intervention to dishonor Akodo Toturi');
        });

        it('should not count your conflicts (2 conflicts)', function() {
            this.noMoreActions();
            this.player1.moveCard(this.cunning, 'play area');
            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [],
                type: 'military'
            });
            this.cunning.bowed = true;
            this.noMoreActions();

            this.noMoreActions();
            this.player2.passConflict();
            this.cunning.bowed = false;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.cunning],
                defenders: [],
                type: 'political'
            });

            this.cunning.honor();
            this.player2.pass();
            this.player1.clickCard(this.intervention);
            this.player1.clickCard(this.cunning);
            expect(this.cunning.isHonored).toBe(false);
            expect(this.cunning.isDishonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Magistrate\'s Intervention to dishonor Cunning Magistrate');
        });

        it('should not count passed conflicts', function() {
            this.noMoreActions();
            this.player1.moveCard(this.cunning, 'play area');
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: [this.cunning],
                type: 'military'
            });

            this.player1.clickCard(this.intervention);
            this.player1.clickCard(this.toturi);
            expect(this.toturi.isHonored).toBe(false);
            expect(this.toturi.isDishonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Magistrate\'s Intervention to dishonor Akodo Toturi');
        });
    });
});
