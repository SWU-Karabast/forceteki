describe('Fett\'s Firespray, Pursuing The Bounty', function () {
    integration(function (contextRef) {
        describe('Fett\'s Firespray\'s When Played ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fetts-firespray#pursuing-the-bounty'],
                        leader: 'boba-fett#daimyo'
                    },
                    player2: {}
                });
            });

            it('should be ready when you control SHD Boba Fett leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should be ready when you control SHD Boba Fett leader unit', function () {
                const { context } = contextRef;
                context.bobaFett.deployed = true;
                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Fett\'s Firespray\'s When Played ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fetts-firespray#pursuing-the-bounty'],
                        leader: 'boba-fett#collecting-the-bounty'
                    },
                    player2: {}
                });
            });

            it('should be ready when you control SOR Boba Fett leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should be ready when you control SOR Boba Fett leader unit', function () {
                const { context } = contextRef;
                context.bobaFett.deployed = true;
                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Fett\'s Firespray\'s When Played ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fetts-firespray#pursuing-the-bounty'],
                        leader: 'sabine-wren#galvanized-revolutionary'
                    },
                    player2: {
                        leader: 'chirrut-imwe#one-with-the-force'
                    }
                });
            });

            it('should not be ready if we do not control any Boba Fett or Jango Fett', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Fett\'s Firespray\'s When Played ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fetts-firespray#pursuing-the-bounty'],
                        groundArena: ['boba-fett#disintegrator'],
                        leader: 'sabine-wren#galvanized-revolutionary'
                    },
                    player2: {
                        leader: 'chirrut-imwe#one-with-the-force'
                    }
                });
            });

            it('should should be as we control Boba Fett unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Fett\'s Firespray\'s When Played ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fetts-firespray#pursuing-the-bounty'],
                        groundArena: ['jango-fett#renowned-bounty-hunter'],
                        leader: 'sabine-wren#galvanized-revolutionary'
                    },
                    player2: {
                        leader: 'chirrut-imwe#one-with-the-force'
                    }
                });
            });

            it('should be ready as we control Jango Fett', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Fett\'s Firespray\'s action ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['jango-fett#renowned-bounty-hunter', 'scout-bike-pursuer'],
                        spaceArena: ['fetts-firespray#pursuing-the-bounty'],
                        resources: 6
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'echo-base-defender']
                    }
                });
            });

            it('should exhaust a non-unique unit', function () {
                const { context } = contextRef;

                // exhaust battlefield marine
                context.player1.clickCard(context.fettsFirespray);
                expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Exhaust a non-unique unit']);
                context.player1.clickPrompt('Exhaust a non-unique unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.scoutBikePursuer, context.echoBaseDefender]);
                context.player1.clickCard(context.battlefieldMarine);

                // fett's firespray should not be exhaust and 2 resources was spent
                expect(context.fettsFirespray.exhausted).toBeFalse();
                expect(context.player1.countExhaustedResources()).toBe(2);
                context.player2.passAction();

                // attack with fett's firespray
                context.player1.clickCard(context.fettsFirespray);
                context.player1.clickPrompt('Attack');
                expect(context.fettsFirespray.exhausted).toBeTrue();
                context.player2.passAction();

                // we still can do his exhaust action even if he's exhausted
                context.player1.clickCard(context.fettsFirespray);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.scoutBikePursuer, context.echoBaseDefender]);
                context.player1.clickCard(context.scoutBikePursuer);
                expect(context.player1.countExhaustedResources()).toBe(4);
            });
        });

        describe('Fett\'s Firespray\'s action ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'fetts-firespray#pursuing-the-bounty', exhausted: true }],
                        resources: 3
                    },
                    player2: {
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            { card: 'echo-base-defender', exhausted: true }
                        ]
                    }
                });
            });

            it('should skip targeting if all targets are exhausted, and should not be available as an action if there aren\'t enough resources', function () {
                const { context } = contextRef;

                // exhaust battlefield marine
                expect(context.fettsFirespray).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.countExhaustedResources()).toBe(2);

                context.player2.passAction();
                expect(context.player1.countSpendableResources()).toBe(1);
                expect(context.fettsFirespray).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });
    });
});
