describe('Trask Walker', function () {
    integration(function (contextRef) {
        describe('Trask Walker\'s ability', function () {
            it('when played — should return a valid discard unit to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['trask-walker'],
                        groundArena: [],
                        discard: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.traskWalker);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHaveExactPromptButtons([
                    'Put on the bottom of your deck and heal 3 damage from your base',
                    'Return it to your hand'
                ]);

                context.player1.clickPrompt('Return it to your hand');
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('when played — should put a valid discard unit on the bottom of deck and heal 3 damage from base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['trask-walker'],
                        groundArena: [],
                        discard: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.setDamage(context.p1Base, 10);

                context.player1.clickCard(context.traskWalker);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHaveExactPromptButtons([
                    'Put on the bottom of your deck and heal 3 damage from your base',
                    'Return it to your hand'
                ]);

                context.player1.clickPrompt('Put on the bottom of your deck and heal 3 damage from your base');
                expect(context.wampa).toBeInZone('deck', context.player1);
                expect(context.p1Base.damage).toEqual(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('on attack — should return a valid discard unit to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['trask-walker'],
                        discard: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.traskWalker);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHaveExactPromptButtons([
                    'Put on the bottom of your deck and heal 3 damage from your base',
                    'Return it to your hand'
                ]);

                context.player1.clickPrompt('Return it to your hand');
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('on attack — should put a valid discard unit on the bottom of deck and heal 3 damage from base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['trask-walker'],
                        discard: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.setDamage(context.p1Base, 10);

                context.player1.clickCard(context.traskWalker);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHaveExactPromptButtons([
                    'Put on the bottom of your deck and heal 3 damage from your base',
                    'Return it to your hand'
                ]);

                context.player1.clickPrompt('Put on the bottom of your deck and heal 3 damage from your base');
                expect(context.wampa).toBeInZone('deck', context.player1);
                expect(context.p1Base.damage).toEqual(7);
                expect(context.player2).toBeActivePlayer();
            });

            it('should only target friendly units in discard that cost 7 or less — not events, upgrades, high-cost units, or opponent\'s units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['trask-walker'],
                        discard: [
                            'wampa',               // valid unit, cost 4
                            'vanquish',            // event — should be excluded
                            'vaders-lightsaber',   // upgrade — should be excluded
                            'blizzard-assault-atat' // unit cost 8 — should be excluded
                        ]
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        discard: ['echo-base-defender'] // p2 unit — should be excluded
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.traskWalker);

                // Only the p1 unit that costs ≤ 7 should be selectable
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                expect(context.player1).not.toBeAbleToSelect(context.vanquish);
                expect(context.player1).not.toBeAbleToSelect(context.vadersLightsaber);
                expect(context.player1).not.toBeAbleToSelect(context.blizzardAssaultAtat);
                expect(context.player1).not.toBeAbleToSelect(context.echoBaseDefender);

                // Resolve the ability to avoid leaving an unresolved prompt
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Return it to your hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not prompt when there are no valid targets in discard', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['trask-walker'],
                        discard: [
                            'vanquish',            // event only — no valid units
                            'blizzard-assault-atat' // unit cost 8 — too expensive
                        ]
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.traskWalker);

                // No valid targets — ability should not prompt, p2 becomes active immediately
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
