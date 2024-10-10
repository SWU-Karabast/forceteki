describe('Pillage', function() {
    integration(function() {
        describe('Pillage\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall', 'pillage', 'green-squadron-awing', 'battlefield-marine'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
            });

            it('should discard', function () {
                this.player1.clickCard(this.pillage);
                expect(this.player1).toBeAbleToSelectExactly([this.rivalsFall, this.greenSquadronAwing, this.battlefieldMarine]);
                this.player1.clickCard(this.rivalsFall);
                this.player1.clickCard(this.greenSquadronAwing);
                this.player1.clickCardNonChecking(this.battlefieldMarine);
                this.player1.clickPrompt('Done');
                expect(this.pillage.location).toBe('discard');
                expect(this.rivalsFall.location).toBe('discard');
                expect(this.greenSquadronAwing.location).toBe('discard');
                expect(this.battlefieldMarine.location).toBe('hand');
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
