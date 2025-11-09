describe('Darth Traya, Lord of Betrayal', function() {
    integration(function(contextRef) {
        describe('Darth Traya\'s attack ability', function() {
            it('should ready a friendly non-unit leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', exhausted: true },
                        groundArena: ['darth-traya#lord-of-betrayal'],
                    },
                    player2: {
                        leader: { card: 'yoda#sensing-darkness', exhausted: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthTraya);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.grandInquisitor, context.yoda]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.grandInquisitor);
                expect(context.grandInquisitor.exhausted).toBe(false);
                expect(context.yoda.exhausted).toBe(true);
            });

            it('should ready an enemy non-unit leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', exhausted: true },
                        groundArena: ['darth-traya#lord-of-betrayal'],
                    },
                    player2: {
                        leader: { card: 'yoda#sensing-darkness', exhausted: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthTraya);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.grandInquisitor, context.yoda]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.yoda);
                expect(context.grandInquisitor.exhausted).toBe(true);
                expect(context.yoda.exhausted).toBe(false);
            });

            it('should ready a double-sided leader', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'chancellor-palpatine#playing-both-sides', exhausted: true },
                        groundArena: ['darth-traya#lord-of-betrayal'],
                    },
                    player2: {
                        leader: { card: 'yoda#sensing-darkness', exhausted: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthTraya);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.chancellorPalpatine, context.yoda]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.chancellorPalpatine);
                expect(context.chancellorPalpatine.exhausted).toBe(false);
                expect(context.yoda.exhausted).toBe(true);
            });

            it('should not be able to ready a friendly leader unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', exhausted: true, deployed: true },
                        groundArena: ['darth-traya#lord-of-betrayal'],
                    },
                    player2: {
                        leader: { card: 'yoda#sensing-darkness', exhausted: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthTraya);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.yoda);
                expect(context.yoda.exhausted).toBe(false);
                expect(context.grandInquisitor.exhausted).toBe(true);
            });


            it('should not be able to ready a friendly vehicle that has become a leader unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#hero-of-yavin',
                        groundArena: ['darth-traya#lord-of-betrayal'],
                        spaceArena: ['alliance-xwing'],
                    },
                    player2: {
                        leader: { card: 'yoda#sensing-darkness', exhausted: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                context.player1.clickCard(context.allianceXwing);

                context.player2.passAction();

                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Pass');

                context.player2.passAction();

                context.player1.clickCard(context.darthTraya);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
                context.player1.clickPrompt('Pass');

                expect(context.allianceXwing.exhausted).toBe(true);
            });
        });
    });
});
