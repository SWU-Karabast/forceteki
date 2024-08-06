describe('Superior Authority', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai', 'doji-challenger', 'daidoji-uji']
                },
                player2: {
                    inPlay: ['moto-youth', 'cunning-negotiator', 'nimble-noyan', 'isawa-tsuke-2']
                }
            });

            this.brash = this.player1.findCardByName('brash-samurai');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.uji = this.player1.findCardByName('daidoji-uji');
            this.youth = this.player2.findCardByName('moto-youth');
            this.negotiator = this.player2.findCardByName('cunning-negotiator');
            this.tsuke = this.player2.findCardByName('isawa-tsuke-2');
            this.noyan = this.player2.findCardByName('nimble-noyan');
        });

        it('when dire and participating should allow bowed characters to contribute skill', function() {
            this.noMoreActions();
            this.noyan.fate = 0;

            this.initiateConflict({
                attackers: [this.brash, this.uji],
                defenders: [this.noyan, this.youth],
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(8);
            expect(this.game.currentConflict.defenderSkill).toBe(7);

            this.uji.bowed = true;
            this.game.checkGameState(true);

            expect(this.game.currentConflict.attackerSkill).toBe(8);
            expect(this.game.currentConflict.defenderSkill).toBe(7);

            this.noyan.bowed = true;
            this.game.checkGameState(true);

            expect(this.game.currentConflict.attackerSkill).toBe(8);
            expect(this.game.currentConflict.defenderSkill).toBe(7);
        });

        it('when dire and not participating should not allow bowed characters to contribute skill', function() {
            this.noMoreActions();
            this.noyan.fate = 0;

            this.initiateConflict({
                attackers: [this.brash, this.uji],
                defenders: [this.tsuke, this.youth],
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(8);
            expect(this.game.currentConflict.defenderSkill).toBe(8);

            this.uji.bowed = true;
            this.game.checkGameState(true);

            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(8);

            this.tsuke.bowed = true;
            this.game.checkGameState(true);

            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(3);
        });

        it('when not dire and participating should not allow bowed characters to contribute skill', function() {
            this.noMoreActions();
            this.noyan.fate = 1;

            this.initiateConflict({
                attackers: [this.brash, this.uji],
                defenders: [this.noyan, this.youth],
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(8);
            expect(this.game.currentConflict.defenderSkill).toBe(7);

            this.uji.bowed = true;
            this.game.checkGameState(true);

            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(7);

            this.noyan.bowed = true;
            this.game.checkGameState(true);

            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(3);
        });

        it('when gaining dire effect should immediately happen', function() {
            this.noMoreActions();
            this.noyan.fate = 1;

            this.initiateConflict({
                attackers: [this.brash, this.uji],
                defenders: [this.noyan, this.youth],
                type: 'military'
            });

            expect(this.game.currentConflict.attackerSkill).toBe(8);
            expect(this.game.currentConflict.defenderSkill).toBe(7);

            this.uji.bowed = true;
            this.game.checkGameState(true);

            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(7);

            this.noyan.bowed = true;
            this.game.checkGameState(true);

            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(3);

            this.player2.clickCard(this.tsuke);
            this.player2.clickPrompt('1');
            this.player2.clickCard(this.noyan);

            expect(this.game.currentConflict.attackerSkill).toBe(8);
            expect(this.game.currentConflict.defenderSkill).toBe(7);
        });
    });
});
