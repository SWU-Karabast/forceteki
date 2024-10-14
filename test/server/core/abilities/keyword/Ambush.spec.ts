describe('Ambush keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Ambush keyword', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['syndicate-lackeys'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'snowspeeder'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('enters play, Ambush allows readying and attacking an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.syndicateLackeys);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Ambush');

                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.snowspeeder]);

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.syndicateLackeys.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(0);
                expect(context.syndicateLackeys.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When a unit with the Ambush keyword', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['syndicate-lackeys'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('enters play and there is only one target, Ambush will automatically choose it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.syndicateLackeys);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Ambush');

                expect(context.syndicateLackeys.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(0);
                expect(context.syndicateLackeys.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When a unit with the Ambush keyword', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['syndicate-lackeys'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('enters play and there is no target, the Ambush prompt will not happen', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.syndicateLackeys);
                expect(context.syndicateLackeys.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
