describe('Boba Fett, Disintegrator', function() {
    integration(function() {
        describe('Boba Fett, Disintegrator\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vambrace-grappleshot'],
                        groundArena: ['boba-fett#disintegrator'],
                    },
                    player2: {
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['lom-pyke#dealer-in-truths', 'consular-security-force', 'entrenched'],
                    }
                });
            });

            it('while attacking an exhausted unit that didn\'t enter play this round, should deal 3 damage to the defender', function () {
                const reset = () => {
                    this.bobaFett.damage = 0;
                    this.bobaFett.exhausted = false;
                    this.consularSecurityForce.damage = 0;
                    this.consularSecurityForce.exhausted = false;
                };
                // Case 1 attacking a ready card
                this.player1.passAction();
                this.player2.clickCard(this.consularSecurityForce);
                this.player1.passAction();

                this.player2.clickCard(this.lukeSkywalker);
                this.player2.clickPrompt('Deploy Luke Skywalker');
                this.moveToNextActionPhase();

                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.consularSecurityForce);

                // check board state
                expect(this.consularSecurityForce.damage).toBe(3);
                expect(this.bobaFett.damage).toBe(3);

                // reset board state
                reset();

                // Case 2 attacking a card played this turn
                expect(this.player2).toBeActivePlayer();
                this.player2.clickCard(this.lomPyke);
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.lomPyke);

                // check board state
                expect(this.player2).toBeActivePlayer();
                expect(this.lomPyke.damage).toBe(3);
                expect(this.bobaFett.damage).toBe(4);

                // reset state
                reset();

                // Case 3 Ability activates when attacking an exhausted unit not played in this phase
                this.consularSecurityForce.exhausted = true;
                this.player2.passAction();
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.consularSecurityForce);

                // check board state
                expect(this.bobaFett.damage).toBe(3);
                expect(this.consularSecurityForce.damage).toBe(6);

                // reset state
                reset();

                this.player2.passAction();

                // Case 4 Ability should activate when attacking leader deployed previous phase
                // TODO The card enteres play event doesn't handle leader deployment correctly so we need to wait for the fix before uncommenting this test.
                /* this.lukeSkywalker.exhausted = true;
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.lukeSkywalker);

                // check board state
                expect(this.lukeSkywalker.damage).toBe(6);
                expect(this.bobaFett.damage).toBe(4);*/

                // Case 5 Ability shouldn't activate when selecting BobaFett's ability first.
                this.player1.clickCard(this.vambraceGrappleshot);
                this.player1.clickCard(this.bobaFett);
                this.player2.passAction();

                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.consularSecurityForce);
                this.player1.clickPrompt('If this unit is attacking an exhausted unit that didn\'t enter play this round, deal 3 damage to the defender.');

                // check game state
                expect(this.consularSecurityForce.damage).toBe(5);
                expect(this.consularSecurityForce.exhausted).toBe(true);

                // reset state
                reset();

                // Case 6 Ability should activate when selecting vambrace-grappleshots ability before Boba Fetts.
                this.player2.clickCard(this.entrenched);
                this.player2.clickCard(this.consularSecurityForce);

                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.consularSecurityForce);
                this.player1.clickPrompt('Exhaust the defender on attack');

                // check game state
                expect(this.consularSecurityForce.damage).toBe(8);
            });
        });
    });
});