describe('Surprise Strike', function() {
    integration(function() {
        describe('Surprise Strike\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['surprise-strike'],
                        groundArena: ['isb-agent', { card: 'wampa', exhausted: true }],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper', 'atst'],
                    }
                });
            });

            it('should allowing triggering an attack and give the attacker +3/+0', function () {
                this.player1.clickCard(this.surpriseStrike);
                expect(this.player1).toBeAbleToSelectExactly([this.isbAgent, this.tielnFighter]);

                this.player1.clickCard(this.isbAgent);
                expect(this.player1).toBeAbleToSelectExactly([this.sundariPeacekeeper, this.atst, this.p2Base]);

                this.player1.clickCard(this.sundariPeacekeeper);
                expect(this.isbAgent.exhausted).toBe(true);
                expect(this.sundariPeacekeeper.damage).toBe(4);
                expect(this.isbAgent.damage).toBe(1);

                // second attack to confirm that the buff is gone
                this.isbAgent.exhausted = false;
                this.player2.passAction();
                this.player1.clickCard(this.isbAgent);
                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(1);
            });
        });
    });
});
