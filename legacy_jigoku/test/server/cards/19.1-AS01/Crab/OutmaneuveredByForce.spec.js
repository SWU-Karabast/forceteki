describe('Outmaneuvered by Force', function () {
    integration(function () {
        describe('Outmaneuvered by Force\'s constant ability', function () {
            describe('For Player 1 with no conflicts declared', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['crisis-breaker'],
                            hand: ['outmaneuvered-by-force']
                        }
                    });
                    this.crisisBreaker =
                        this.player1.findCardByName('crisis-breaker');
                    this.outmaneuveredByForce = this.player1.findCardByName(
                        'outmaneuvered-by-force'
                    );
                });

                it('immediately declare conflict', function () {
                    this.player1.clickCard(this.outmaneuveredByForce);
                    expect(this.player1).toHavePrompt('Initiate Conflict');
                });
            });

            describe('For Player 2 with no conflicts declared', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player2: {
                            inPlay: ['crisis-breaker'],
                            hand: ['outmaneuvered-by-force']
                        }
                    });
                    this.crisisBreaker =
                        this.player2.findCardByName('crisis-breaker');
                    this.outmaneuveredByForce = this.player2.findCardByName(
                        'outmaneuvered-by-force'
                    );
                });

                it('immediately declare conflict', function () {
                    this.player1.pass();
                    this.player2.clickCard(this.outmaneuveredByForce);
                    expect(this.player2).toHavePrompt('Initiate Conflict');
                });
            });

            describe('Depending on high printed military character', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['matsu-seventh-legion'],
                            hand: ['outmaneuvered-by-force']
                        }
                    });
                    this.matsuSeventhLegion = this.player1.findCardByName(
                        'matsu-seventh-legion'
                    );
                    this.outmaneuveredByForce = this.player1.findCardByName(
                        'outmaneuvered-by-force'
                    );
                });

                it('immediately declare conflict', function () {
                    this.player1.clickCard(this.outmaneuveredByForce);
                    expect(this.player1).toHavePrompt('Initiate Conflict');
                });
            });

            describe('With high military skill, but too low printed value', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['commander-of-the-legions'],
                            hand: ['fine-katana', 'outmaneuvered-by-force']
                        }
                    });
                    this.commanderOfTheLegions = this.player1.findCardByName(
                        'commander-of-the-legions'
                    );
                    this.fineKatana =
                        this.player1.findCardByName('fine-katana');
                    this.outmaneuveredByForce = this.player1.findCardByName(
                        'outmaneuvered-by-force'
                    );
                });

                it('cannot be used', function () {
                    this.player1.clickCard(this.fineKatana);
                    this.player1.clickCard(this.commanderOfTheLegions);
                    this.player2.pass();
                    this.player1.clickCard(this.outmaneuveredByForce);
                    expect(this.player1).not.toBeAbleToSelect(
                        this.outmaneuveredByForce
                    );
                });
            });

            describe('When conflicts were declared', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['adept-of-the-waves']
                        },
                        player2: {
                            inPlay: ['crisis-breaker'],
                            hand: ['outmaneuvered-by-force']
                        }
                    });
                    this.adeptOfTheWaves =
                        this.player1.findCardByName('adept-of-the-waves');
                    this.crisisBreaker =
                        this.player2.findCardByName('crisis-breaker');
                    this.outmaneuveredByForce = this.player2.findCardByName(
                        'outmaneuvered-by-force'
                    );
                });

                it('cannot be used', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        attackers: [this.adeptOfTheWaves],
                        defenders: []
                    });
                    this.noMoreActions();
                    this.player1.clickPrompt('Don\'t Resolve');

                    this.player1.pass();
                    expect(this.player2).not.toBeAbleToSelect(
                        this.outmaneuveredByForce
                    );
                });
            });
        });
    });
});
