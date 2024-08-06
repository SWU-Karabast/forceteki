describe('Masashigi\'s Sacrifice', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['hida-guardian', 'lion-s-pride-brawler', 'doji-kuwanan']
                },
                player2: {
                    inPlay: ['hida-guardian', 'lion-s-pride-brawler', 'doji-kuwanan', 'doji-diplomat'],
                    hand: ['masashigi-s-sacrifice']
                }
            });

            this.hidaGuardian = this.player1.findCardByName('hida-guardian');
            this.brawler = this.player1.findCardByName('lion-s-pride-brawler');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');

            this.hidaGuardian2 = this.player2.findCardByName('hida-guardian');
            this.brawler2 = this.player2.findCardByName('lion-s-pride-brawler');
            this.kuwanan2 = this.player2.findCardByName('doji-kuwanan');
            this.diplomat = this.player2.findCardByName('doji-diplomat');

            this.hidaGuardian.taint();
            this.brawler2.honor();
            this.diplomat.dishonor();
            this.diplomat.taint();

            this.sac = this.player2.findCardByName('masashigi-s-sacrifice');
            this.noMoreActions();
        });

        it('should not apply if there are no defenders', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.hidaGuardian, this.brawler, this.kuwanan],
                defenders: []
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.sac);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should prompt you to sacrifice a character with a status token', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.hidaGuardian, this.brawler, this.kuwanan],
                defenders: [this.hidaGuardian2, this.brawler2, this.kuwanan2]
            });
            this.player2.clickCard(this.sac);
            expect(this.player2).toHavePrompt('Select card to sacrifice');
            expect(this.player2).not.toBeAbleToSelect(this.hidaGuardian2);
            expect(this.player2).toBeAbleToSelect(this.brawler2);
            expect(this.player2).not.toBeAbleToSelect(this.kuwanan2);
            expect(this.player2).toBeAbleToSelect(this.diplomat);
            expect(this.player2).not.toBeAbleToSelect(this.hidaGuardian);
        });

        it('should not bow as a result of resolution', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.hidaGuardian, this.brawler, this.kuwanan],
                defenders: [this.hidaGuardian2, this.brawler2, this.kuwanan2]
            });
            this.player2.clickCard(this.sac);
            this.player2.clickCard(this.diplomat);
            expect(this.getChatLogs(5)).toContain('player2 plays Masashigi\'s Sacrifice, sacrificing Doji Diplomat to prevent defending characters from bowing at the end of a the conflict');
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');

            expect(this.hidaGuardian.bowed).toBe(true);
            expect(this.brawler.bowed).toBe(true);
            expect(this.kuwanan.bowed).toBe(true);
            expect(this.hidaGuardian2.bowed).toBe(false);
            expect(this.brawler2.bowed).toBe(false);
            expect(this.kuwanan2.bowed).toBe(false);
        });

        it('should apply to opponents characters if you are attacking', function () {
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.hidaGuardian2, this.brawler2, this.kuwanan2],
                defenders: [this.hidaGuardian, this.brawler, this.kuwanan]
            });

            this.player1.pass();
            this.player2.clickCard(this.sac);
            this.player2.clickCard(this.diplomat);
            this.noMoreActions();

            expect(this.hidaGuardian.bowed).toBe(false);
            expect(this.brawler.bowed).toBe(false);
            expect(this.kuwanan.bowed).toBe(false);
            expect(this.hidaGuardian2.bowed).toBe(true);
            expect(this.brawler2.bowed).toBe(true);
            expect(this.kuwanan2.bowed).toBe(true);
        });
    });
});
