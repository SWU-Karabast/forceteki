describe('Bloodthirsty Onryō', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-diplomat', 'student-of-anatomies'],
                    hand: ['assassination', 'cloud-the-mind'],
                    dynastyDiscard: ['bloodthirsty-onryo']
                }
            });

            this.student = this.player1.findCardByName('student-of-anatomies');
            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.onryo = this.player1.findCardByName('bloodthirsty-onryo');
            this.assassination = this.player1.findCardByName('assassination');
            this.cloud = this.player1.findCardByName('cloud-the-mind');
        });

        it('should sacrifice someone to be put into play from discard pile', function () {
            this.player1.clickCard(this.onryo);
            this.player1.clickCard(this.diplomat);
            expect(this.onryo.location).toBe('play area');
            expect(this.onryo.isTainted).toBe(true);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Bloodthirsty Onryō, sacrificing Doji Diplomat to put Bloodthirsty Onryō into play'
            );
        });

        it('should sacrifice someone to be put into play from province', function () {
            this.player1.moveCard(this.onryo, 'province 1');
            this.game.checkGameState(true);
            this.player1.clickCard(this.onryo);
            this.player1.clickCard(this.diplomat);
            expect(this.onryo.location).toBe('play area');
            expect(this.onryo.isTainted).toBe(true);
        });

        it('should remove from game when it leaves play', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.onryo);
            this.player1.clickCard(this.diplomat);
            expect(this.onryo.location).toBe('play area');
            expect(this.onryo.isParticipating()).toBe(false);
            this.player2.pass();
            this.player1.clickCard(this.assassination);
            this.player1.clickCard(this.onryo);
            expect(this.onryo.location).toBe('removed from game');
            expect(this.getChatLogs(5)).toContain('Bloodthirsty Onryō is removed from the game due to leaving play');
        });

        it('should remove from game even if blanked', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.onryo);
            this.player1.clickCard(this.diplomat);
            expect(this.onryo.location).toBe('play area');
            expect(this.onryo.isParticipating()).toBe(false);
            this.player2.pass();
            this.player1.clickCard(this.student);
            this.player1.clickCard(this.onryo);
            this.player1.clickCard(this.student);
            this.player2.pass();
            this.player1.clickCard(this.assassination);
            this.player1.clickCard(this.onryo);
            expect(this.onryo.location).toBe('removed from game');
            expect(this.getChatLogs(5)).toContain('Bloodthirsty Onryō is removed from the game due to leaving play');
        });
    });
});
