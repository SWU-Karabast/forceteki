describe('Unbridled Ambition', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['adept-of-shadows'],
                    hand: ['way-of-the-scorpion']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-challenger'],
                    hand: ['court-games'],
                    provinces: ['unbridled-ambition', 'fertile-fields']
                }
            });

            this.adeptOfShadows = this.player1.findCardByName('adept-of-shadows');
            this.wayOfTheScorpion = this.player1.findCardByName('way-of-the-scorpion');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.dojiChallenger = this.player2.findCardByName('doji-challenger');
            this.courtGames = this.player2.findCardByName('court-games');
            this.ambition = this.player2.findCardByName('unbridled-ambition');
            this.fertile = this.player2.findCardByName('fertile-fields');
        });

        it('should prevent dishonored opponent characters from contributing to the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows],
                defenders: [this.dojiWhisperer, this.dojiChallenger],
                type: 'political',
                province: this.ambition
            });
            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(6);
            this.player2.pass();
            this.player1.clickCard(this.wayOfTheScorpion);
            this.player1.clickCard(this.dojiWhisperer);
            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(3);
        });

        it('should prevent your dishonored characters from contributing to the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows],
                defenders: [this.dojiWhisperer, this.dojiChallenger],
                type: 'political',
                province: this.ambition
            });
            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(6);
            this.player2.clickCard(this.courtGames);
            this.player2.clickPrompt('Dishonor an opposing character');
            this.player1.clickCard(this.adeptOfShadows);
            expect(this.game.currentConflict.attackerSkill).toBe(0);
            expect(this.game.currentConflict.defenderSkill).toBe(6);
        });

        it('rehonoring should allow contributing to the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows],
                defenders: [this.dojiWhisperer, this.dojiChallenger],
                type: 'political',
                province: this.ambition
            });
            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(6);
            this.player2.pass();
            this.player1.clickCard(this.wayOfTheScorpion);
            this.player1.clickCard(this.dojiWhisperer);
            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(3);

            this.player2.clickCard(this.courtGames);
            this.player2.clickPrompt('Honor a friendly character');
            this.player2.clickCard(this.dojiWhisperer);
            expect(this.game.currentConflict.attackerSkill).toBe(2);
            expect(this.game.currentConflict.defenderSkill).toBe(6);
        });
    });
});
