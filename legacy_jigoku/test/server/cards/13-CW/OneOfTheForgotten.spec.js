describe('One of the Forgotten', function() {
    integration(function() {
        describe('One of the Forgotten\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['asako-tsuki'],
                        hand: ['against-the-waves']
                    },
                    player2: {
                        inPlay: ['one-of-the-forgotten']
                    }
                });
                this.asakoTsuki = this.player1.findCardByName('asako-tsuki');
                this.forgotten = this.player2.findCardByName('one-of-the-forgotten');

                this.atw = this.player1.findCardByName('against-the-waves');
            });

            it('should prompt you to put a fate on the character if opponent passes with a ready character', function() {
                let fate = this.forgotten.fate;
                this.noMoreActions();
                this.player1.passConflict();
                expect(this.player2).toHavePrompt('Triggered abilities');
                expect(this.player2).toBeAbleToSelect(this.forgotten);
                this.player2.clickCard(this.forgotten);
                expect(this.forgotten.fate).toBe(fate + 1);
            });

            it('should not prompt you if opponent passes with no ready characters', function() {
                let fate = this.forgotten.fate;
                this.player1.clickCard(this.atw);
                this.player1.clickCard(this.asakoTsuki);
                this.noMoreActions();
                expect(this.getChatLogs(1)).toContain('player1 passes their conflict opportunity as none of their characters can be declared as an attacker');
                expect(this.player2).not.toHavePrompt('Triggered abilities');
                expect(this.player2).not.toBeAbleToSelect(this.forgotten);
                this.player2.clickCard(this.forgotten);
                expect(this.forgotten.fate).toBe(fate);
            });

            it('should not prompt you to gain two fate if you pass with ready characters', function() {
                let fate = this.forgotten.fate;
                this.player1.clickCard(this.atw);
                this.player1.clickCard(this.asakoTsuki);
                this.noMoreActions();
                expect(this.getChatLogs(1)).toContain('player1 passes their conflict opportunity as none of their characters can be declared as an attacker');
                expect(this.player2).not.toHavePrompt('Triggered abilities');
                expect(this.player2).not.toBeAbleToSelect(this.forgotten);
                this.player2.clickCard(this.forgotten);
                expect(this.forgotten.fate).toBe(fate);

                this.noMoreActions();
                this.player2.passConflict();

                expect(this.player2).not.toHavePrompt('Triggered abilities');
                expect(this.player2).not.toBeAbleToSelect(this.forgotten);
                this.player2.clickCard(this.forgotten);
                expect(this.forgotten.fate).toBe(fate);
            });
        });

        describe('One of the Forgotten\'s static ability - from provinces', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        inPlay: ['daidoji-uji'],
                        hand: ['way-of-the-crane'],
                        dynastyDiscard: ['one-of-the-forgotten']
                    },
                    player2: {
                    }
                });
                this.uji = this.player1.findCardByName('daidoji-uji');
                this.forgotten = this.player1.findCardByName('one-of-the-forgotten');
                this.crane = this.player1.findCardByName('way-of-the-crane');

                this.player1.moveCard(this.forgotten, 'province 1');
                this.player1.clickCard(this.crane);
                this.player1.clickCard(this.uji);

                this.player2.pass();
            });

            it('should not allow you to put fate on character if it is played from your province', function() {
                this.player1.clickCard(this.forgotten);
                expect(this.player1).toHavePromptButton('0');
                expect(this.player1).not.toHavePromptButton('1');
                expect(this.player1).not.toHavePromptButton('2');
            });

            it('should prompt you for fate if its "as if from hand" despite it being in a province', function() {
                this.player1.pass();
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                this.player1.clickCard(this.forgotten);
                expect(this.player1).toHavePromptButton('0');
                expect(this.player1).toHavePromptButton('1');
                expect(this.player1).toHavePromptButton('2');
            });
        });

        describe('One of the Forgotten\'s static ability - from non-province', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['daidoji-uji']
                    },
                    player2: {
                        dynastyDiscard: ['one-of-the-forgotten'],
                        provinces: ['gateway-to-meido']
                    }
                });
                this.uji = this.player1.findCardByName('daidoji-uji');
                this.forgotten = this.player2.findCardByName('one-of-the-forgotten');
                this.meido = this.player2.findCardByName('gateway-to-meido');

                this.noMoreActions();
            });

            it('should allow you to put fate on character if it is played from your discard', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.uji],
                    defenders: [],
                    province: this.meido
                });

                this.player2.clickCard(this.forgotten);
                expect(this.player2).toHavePromptButton('0');
                expect(this.player2).toHavePromptButton('1');
                expect(this.player2).toHavePromptButton('2');
            });
        });

        describe('One of the Forgotten\'s static ability - Kyuden Hida', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        stronghold: 'kyuden-hida',
                        dynastyDiscard: ['one-of-the-forgotten', 'borderlands-defender', 'hida-guardian'],
                        dynastyDeckSize: 4
                    },
                    player2: {
                    }
                });
                this.forgotten = this.player1.findCardByName('one-of-the-forgotten');
                this.borderlands = this.player1.findCardByName('borderlands-defender');
                this.hidaGuardian = this.player1.findCardByName('hida-guardian');
                this.kyudenHida = this.player1.findCardByName('kyuden-hida');

                this.player1.moveCard(this.borderlands, 'dynasty deck');
                this.player1.moveCard(this.hidaGuardian, 'dynasty deck');
                this.player1.moveCard(this.forgotten, 'dynasty deck');
            });

            it('should not allow you to put fate on character if it is played as if from your provinces', function() {
                this.player1.clickCard(this.kyudenHida);
                expect(this.player1).toHavePromptButton('One of the Forgotten');

                this.player1.clickPrompt('One of the Forgotten');
                expect(this.player1).toHavePromptButton('0');
                expect(this.player1).not.toHavePromptButton('1');
                expect(this.player1).not.toHavePromptButton('2');
            });
        });
    });
});
