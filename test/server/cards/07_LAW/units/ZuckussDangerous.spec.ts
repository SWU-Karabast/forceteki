describe('Zuckuss, Dangerous', function() {
    integration(function(contextRef) {
        describe('Zuckuss\'s on attack ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['zuckuss#dangerous', 'greedo#slow-on-the-draw'],
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal damage equal to his power to a ground unit when controlling another Bounty Hunter', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.zuckussDangerous);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.greedo, context.zuckussDangerous]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to pass the ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.zuckussDangerous);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Pass');

                expect(context.wampa.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should not deal damage when not controlling another Bounty Hunter', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['zuckuss#dangerous'],
                },
                player2: {
                    groundArena: ['wampa', 'battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zuckussDangerous);
            context.player1.clickCard(context.p2Base);

            expect(context.wampa.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('should deal increased damage when Zuckuss has upgrades', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [
                        { card: 'zuckuss#dangerous', upgrades: ['experience', 'experience'] },
                        'greedo#slow-on-the-draw'
                    ],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zuckussDangerous);
            context.player1.clickCard(context.p2Base);

            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not count opponent\'s Bounty Hunters', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['zuckuss#dangerous'],
                },
                player2: {
                    groundArena: ['greedo#slow-on-the-draw'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.zuckussDangerous);
            context.player1.clickCard(context.p2Base);

            expect(context.greedo.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});