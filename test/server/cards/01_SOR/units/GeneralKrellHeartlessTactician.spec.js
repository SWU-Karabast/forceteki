describe('General Krell, Heartless Tactician', function() {
    integration(function() {
        describe('Krell\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'general-krell#heartless-tactician'],
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa', 'atat-suppressor'],
                        spaceArena: ['avenger#hunting-star-destroyer']
                    }
                });
            });

            it('grants a "draw card on defeat" ability to all other friendly units', function () {
                const startingHandSize = this.player1.handSize;

                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.wampa);
                expect(this.battlefieldMarine).toBeInLocation('discard');
                expect(this.player1.handSize).toBe(startingHandSize + 1);
            });
        });
    });
});
