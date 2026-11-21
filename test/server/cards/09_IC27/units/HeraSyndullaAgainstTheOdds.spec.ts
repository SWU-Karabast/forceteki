describe('Hera Syndulla, Against the Odds', function() {
    integration(function(contextRef) {
        describe('its triggered ability', function() {
            it('deals 1 damage to a chosen base when you play a Rebel card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['hera-syndulla#against-the-odds'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePrompt('Deal 1 damage to a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(1);
                expect(context.p1Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('triggers again when you play a second Rebel card the same phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'rebel-pathfinder'],
                        groundArena: ['hera-syndulla#against-the-odds'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
                context.player2.passAction();

                context.player1.clickCard(context.rebelPathfinder);

                expect(context.player1).toHavePrompt('Deal 1 damage to a base');
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.p1Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('can deal the damage to your own base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['hera-syndulla#against-the-odds'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(1);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when you play a non-Rebel card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa'],
                        groundArena: ['hera-syndulla#against-the-odds'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when an opponent plays a Rebel card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hera-syndulla#against-the-odds']
                    },
                    player2: {
                        hand: ['battlefield-marine'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.battlefieldMarine);

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });

            it('does not trigger on its own play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hera-syndulla#against-the-odds'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.heraSyndulla);

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
