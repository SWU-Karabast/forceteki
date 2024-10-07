describe('Rebel Assault', function () {
    integration(function () {
        describe('Rebel Assault\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['rebel-assault'],
                        groundArena: ['pyke-sentinel', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {}
                });
            });

            it('should initiate 2 attacks with +1/+0', function () {
                this.player1.clickCard(this.rebelAssault);
                expect(this.player1).toBeAbleToSelectExactly([this.greenSquadronAwing, this.battlefieldMarine, this.chirrutImwe]);

                this.player1.clickCard(this.battlefieldMarine);
                // base was automatically choose

                this.player1.clickCard(this.chirrutImwe);
                // base was automatically choose

                expect(this.player2).toBeActivePlayer();
                expect(this.p2Base.damage).toBe(8);
            });

            it('should initiate only 1 attack with +1/+0', function () {
                this.battlefieldMarine.exhausted = true;
                this.chirrutImwe.exhausted = true;

                this.player1.clickCard(this.rebelAssault);

                // no one can be chosen anymore > next player action
                expect(this.player2).toBeActivePlayer();
                expect(this.p2Base.damage).toBe(4);
            });
        });
    });
});
