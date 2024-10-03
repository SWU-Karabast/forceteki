describe('Vigilant Honor Guards', function() {
    integration(function() {
        describe('Vigilant Honor Guards\' ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['consular-security-force']
                    },
                    player2: {
                        groundArena: ['vigilant-honor-guards'],
                        hand: ['repair']
                    }
                });
            });

            it('should give it sentinel only as long as it is undamaged', function () {
                this.player1.clickCard(this.consularSecurityForce);
                // Honor Guards automatically selected due to sentinel
                expect(this.player2).toBeActivePlayer();
                expect(this.vigilantHonorGuards.damage).toBe(3);
                expect(this.consularSecurityForce.damage).toBe(4);

                this.player2.pass();
                this.consularSecurityForce.exhausted = false;

                this.player1.clickCard(this.consularSecurityForce);
                expect(this.player1).toBeAbleToSelectExactly([this.vigilantHonorGuards, this.p2Base]); // no sentinel
                this.player1.clickCard(this.p2Base);

                // checking if they regain sentinel when fully healed
                this.player2.clickCard(this.repair);
                this.player2.clickCard(this.vigilantHonorGuards);
                expect(this.vigilantHonorGuards.damage).toBe(0);

                this.consularSecurityForce.exhausted = false;

                this.player1.clickCard(this.consularSecurityForce);
                // Honor Guards automatically selected due to sentinel
                expect(this.player2).toBeActivePlayer();
                expect(this.vigilantHonorGuards.damage).toBe(3);
                expect(this.consularSecurityForce).toBeInLocation('discard');
            });
        });
    });
});
