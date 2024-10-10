describe('Boba Fett Disintegrator', function() {
    integration(function() {
        describe('Boba Fett Disintegrator\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['boba-fett#disintegrator'],
                    },
                    player2: {
                        groundArena: ['wampa', 'consular-security-force'],
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['lom-pyke#dealer-in-truths'],
                    }
                });
            });

            it('should have no effect when attacking a ready unit or a exhausted unit played this turn.', function () {
                // Case 1 attacking a ready card
                expect(this.player1).toBeActivePlayer();
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.wampa);

                // check board state
                expect(this.wampa.damage).toBe(3);
                expect(this.bobaFett.damage).toBe(4);

                // reset board state
                this.bobaFett.damage = 0;
                this.bobaFett.exhausted = false;
                this.wampa.damage = 0;

                // Case 2 attacking a card played this turn
                expect(this.player2).toBeActivePlayer();
                this.player2.clickCard(this.lomPyke);
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.lomPyke);

                // check board state
                expect(this.player2).toBeActivePlayer();
                expect(this.lomPyke.damage).toBe(3);
                expect(this.bobaFett.damage).toBe(4);
            });

            it('Should activate when attacking a exhausted unit not played in this phase.', function() {
                // actual attack action
                this.consularSecurityForce.exhausted = true;
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.consularSecurityForce);

                // check board state
                expect(this.bobaFett.damage).toBe(3);
                expect(this.consularSecurityForce.damage).toBe(6);
            });

            // TODO The card enteres play event doesn't handle leader deployment correctly so we need to wait for the fix before uncommenting this test.
            /* it('Shouldn\'t activate when attacking a exhausted leader unit deployed in a previous phase.', function() {
                // initial phase
                this.player1.passAction();
                this.player2.clickCard(this.lukeSkywalker);
                this.player2.clickPrompt('Deploy Luke Skywalker');
                this.moveToNextActionPhase();

                // reset state
                this.lukeSkywalker.exhausted = true;
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.lukeSkywalker);

                // check board state
                expect(this.lukeSkywalker.damage).toBe(3);
            });*/
        });

        describe('Boba Fett Disintegrator\'s ability.', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'boba-fett#disintegrator', upgrades: ['vambrace-grappleshot'] }],
                    },
                    player2: {
                        hand: ['wampa', 'lom-pyke#dealer-in-truths'],
                    }
                });
            });

            it('should have effect when selecting Boba Fett Disintegrator\'s ability to trigger after vambrace-grappleshot on attack ability.', function () {
                // Case 1 attacking a ready card
                // first phase to play wampa
                expect(this.player1).toBeActivePlayer();
                this.player1.passAction();
                this.player2.clickCard(this.wampa);
                this.player1.passAction();
                this.player2.clickCard(this.lomPyke);
                this.moveToNextActionPhase();

                // actual attack
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.wampa);
                this.player1.clickPrompt('Exhaust the defender on attack');

                // check board state
                expect(this.player2).toBeActivePlayer();
                expect(this.bobaFett.location).toBe('ground arena');
                expect(this.wampa.location).toBe('discard');

                // Case 2 selecting vambrace-grappleshot after Boba Fett's ability should only deal 5 damage to target.
                this.moveToNextActionPhase();
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.lomPyke);
                this.player1.clickPrompt('If this unit is attacking an exhausted unit that didn\'t enter play this round, deal 3 damage to the defender.');

                // check board state
                expect(this.bobaFett.location).toBe('discard');
                expect(this.lomPyke.exhausted).toBe(true);
                expect(this.lomPyke.damage).toBe(5);
            });
        });
    });
});