describe('Talisman of the Sun', function() {
    integration(function() {
        describe('Talisman of the Sun\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['shrine-maiden'],
                        provinces: ['manicured-garden'],
                        dynastyDiscard: ['hantei-xxxviii']
                    },
                    player2: {
                        provinces: ['public-forum', 'sanpuku-seido'],
                        inPlay: ['serene-warrior'],
                        hand: ['talisman-of-the-sun']
                    }
                });
                this.emperor = this.player1.findCardByName('hantei-xxxviii');
                this.player1.pass();
                this.garden = this.player1.findCardByName('manicured-garden');
                this.seido = this.player2.findCardByName('sanpuku-seido');
                this.forum = this.player2.findCardByName('public-forum');
                this.talismanOfTheSun = this.player2.playAttachment('talisman-of-the-sun', 'serene-warrior');
                this.noMoreActions();
                this.initiateConflict({
                    ring: 'air',
                    province: 'public-forum',
                    attackers: ['shrine-maiden'],
                    defenders: ['serene-warrior']
                });
            });

            it('should move the conflict to a new province', function() {
                this.player2.clickCard(this.talismanOfTheSun);
                expect(this.player2).toHavePrompt('Talisman of the Sun');
                expect(this.player2).not.toBeAbleToSelect(this.garden);
                expect(this.player2).not.toBeAbleToSelect(this.forum);
                expect(this.player2).toBeAbleToSelect(this.seido);
                this.sanpukuSeido = this.player2.clickCard('sanpuku-seido');
                expect(this.sanpukuSeido.inConflict).toBe(true);
                expect(this.game.currentConflict.conflictProvince).toBe(this.sanpukuSeido);

                expect(this.getChatLogs(4)).toContain('player2 uses Talisman of the Sun, bowing Talisman of the Sun to move the conflict to another eligible province');
                expect(this.getChatLogs(3)).toContain('player2 moves the conflict to Sanpuku Seidō');
            });

            it('should apply any constant abilities of the new province', function() {
                this.player2.clickCard(this.talismanOfTheSun);
                this.sanpukuSeido = this.player2.clickCard('sanpuku-seido');
                expect(this.game.currentConflict.attackerSkill).toBe(0);
                expect(this.game.currentConflict.defenderSkill).toBe(4);
            });

            it('should not allow emperor to pick the new province', function() {
                this.player1.moveCard(this.emperor, 'play area');
                this.game.checkGameState(true);
                this.player2.clickCard(this.talismanOfTheSun);
                this.sanpukuSeido = this.player2.clickCard('sanpuku-seido');
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).not.toBeAbleToSelect(this.emperor);
                expect(this.game.currentConflict.attackerSkill).toBe(0);
                expect(this.game.currentConflict.defenderSkill).toBe(4);
            });
        });
    });
});
