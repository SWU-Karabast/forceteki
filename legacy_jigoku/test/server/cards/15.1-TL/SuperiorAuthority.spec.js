describe('Superior Authority', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai', 'doji-challenger', 'daidoji-uji', 'hiruma-yoshino'],
                    hand: ['superior-authority'],
                    dynastyDiscard: ['favorable-ground']
                },
                player2: {
                    inPlay: ['moto-youth', 'cunning-negotiator', 'doji-hotaru', 'isawa-tsuke-2', 'reclusive-zokujin'],
                    hand: ['charge', 'called-to-war'],
                    dynastyDiscard: ['moto-chagatai']
                }
            });

            this.brash = this.player1.findCardByName('brash-samurai');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.uji = this.player1.findCardByName('daidoji-uji');
            this.youth = this.player2.findCardByName('moto-youth');
            this.negotiator = this.player2.findCardByName('cunning-negotiator');
            this.hotaru = this.player2.findCardByName('doji-hotaru');
            this.tsuke = this.player2.findCardByName('isawa-tsuke-2');
            this.yoshino = this.player1.findCardByName('hiruma-yoshino');

            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');

            this.ground = this.player1.placeCardInProvince('favorable-ground', 'province 1');
            this.authority = this.player1.findCardByName('superior-authority');
            this.charge = this.player2.findCardByName('charge');
            this.calledToWar = this.player2.findCardByName('called-to-war');
            this.chagatai = this.player2.placeCardInProvince('moto-chagatai', 'province 1');
            this.zokujin = this.player2.findCardByName('reclusive-zokujin');
        });

        it('should not trigger outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.authority);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should prevent characters with 0 fate from counting skill', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.negotiator],
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(3);
            expect(this.game.currentConflict.defenderSkill).toBe(1);
            this.player2.pass();
            this.player1.clickCard(this.authority);
            expect(this.game.currentConflict.attackerSkill).toBe(0);
            expect(this.game.currentConflict.defenderSkill).toBe(0);
        });

        it('should not prevent characters with one or more fate from counting skill', function() {
            this.noMoreActions();
            this.negotiator.fate = 1;

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.negotiator],
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(3);
            expect(this.game.currentConflict.defenderSkill).toBe(1);
            this.player2.pass();
            this.player1.clickCard(this.authority);
            expect(this.game.currentConflict.attackerSkill).toBe(0);
            expect(this.game.currentConflict.defenderSkill).toBe(1);
        });

        it('should be able to play if there are no characters with 0 fate', function() {
            this.noMoreActions();
            this.challenger.fate = 1;
            this.negotiator.fate = 1;

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.negotiator],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.authority);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should prevent characters that move into the conflict from contributing', function() {
            this.noMoreActions();
            this.negotiator.fate = 1;

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.negotiator],
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(3);
            expect(this.game.currentConflict.defenderSkill).toBe(1);
            this.player2.pass();
            this.player1.clickCard(this.authority);
            expect(this.game.currentConflict.attackerSkill).toBe(0);
            expect(this.game.currentConflict.defenderSkill).toBe(1);
            this.player2.pass();
            this.player1.clickCard(this.ground);
            this.player1.clickCard(this.uji);
            expect(this.game.currentConflict.attackerSkill).toBe(0);
            expect(this.game.currentConflict.defenderSkill).toBe(1);
        });

        it('should prevent characters that are put into play into the conflict from contributing', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.negotiator],
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(3);
            expect(this.game.currentConflict.defenderSkill).toBe(1);
            this.player2.pass();
            this.player1.clickCard(this.authority);
            expect(this.game.currentConflict.attackerSkill).toBe(0);
            expect(this.game.currentConflict.defenderSkill).toBe(0);
            this.player2.clickCard(this.charge);
            this.player2.clickCard(this.chagatai);
            expect(this.game.currentConflict.attackerSkill).toBe(0);
            expect(this.game.currentConflict.defenderSkill).toBe(0);
        });

        it('should allow you to contribute if you put fate on the character', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.hotaru],
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(3);
            expect(this.game.currentConflict.defenderSkill).toBe(3);
            this.player2.pass();
            this.player1.clickCard(this.authority);
            expect(this.game.currentConflict.attackerSkill).toBe(0);
            expect(this.game.currentConflict.defenderSkill).toBe(0);
            this.player2.clickCard(this.calledToWar);
            this.player2.clickCard(this.hotaru);
            this.player1.clickPrompt('Yes');
            this.player1.clickCard(this.challenger);
            expect(this.game.currentConflict.attackerSkill).toBe(3);
            expect(this.game.currentConflict.defenderSkill).toBe(3);
        });

        it('should have characters stop contributing if you remove their fate', function() {
            this.noMoreActions();

            this.challenger.fate = 1;
            this.hotaru.fate = 1;
            this.tsuke.fate = 1;

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.hotaru, this.tsuke],
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(3);
            expect(this.game.currentConflict.defenderSkill).toBe(8);
            this.player2.pass();
            this.player1.clickCard(this.authority);
            expect(this.game.currentConflict.attackerSkill).toBe(3);
            expect(this.game.currentConflict.defenderSkill).toBe(8);
            this.player2.clickCard(this.tsuke);
            this.player2.clickPrompt('2');
            this.player2.clickCard(this.challenger);
            this.player2.clickCard(this.hotaru);
            this.player2.clickPrompt('Done');
            expect(this.game.currentConflict.attackerSkill).toBe(0);
            expect(this.game.currentConflict.defenderSkill).toBe(5);
        });

        it('Zokujin should be immune during earth conflicts', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.zokujin],
                ring: 'earth',
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(3);
            expect(this.game.currentConflict.defenderSkill).toBe(3);
            this.player2.pass();
            this.player1.clickCard(this.authority);
            expect(this.game.currentConflict.attackerSkill).toBe(0);
            expect(this.game.currentConflict.defenderSkill).toBe(3);
        });

        it('Yoshino character shouldn\'t count', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.yoshino],
                defenders: [this.negotiator],
                province: this.sd1,
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(3);
            expect(this.game.currentConflict.defenderSkill).toBe(1);
            this.player2.pass();
            this.player1.clickCard(this.yoshino);
            this.player1.clickCard(this.chagatai);
            expect(this.game.currentConflict.attackerSkill).toBe(9);
            expect(this.game.currentConflict.defenderSkill).toBe(1);
            this.player2.pass();
            this.player1.clickCard(this.authority);
            expect(this.game.currentConflict.attackerSkill).toBe(0);
            expect(this.game.currentConflict.defenderSkill).toBe(0);
        });

        it('chat message', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.negotiator],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.authority);
            expect(this.getChatLogs(5)).toContain('player1 plays Superior Authority to make it so that participating characters with 0 fate cannot contribute skill to conflict resolution');
        });
    });
});
