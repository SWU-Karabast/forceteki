describe('Darth Vader, Unstoppable', function () {
    integration(function (contextRef) {
        describe('Darth Vader\'s leader side ability', function () {
            it('should deal 1 damage to a unit when discarding a card and exhausting', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#unstoppable',
                        hand: ['battlefield-marine', 'wampa'],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deal 1 damage to a unit or base');

                // Select target first, then discard as cost
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.p1Base, context.p2Base]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.pykeSentinel);

                // Then select card to discard from hand as cost
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.pykeSentinel.damage).toBe(1);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.darthVader.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should not have the action ability available when hand is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#unstoppable',
                        hand: [],
                        resources: 3, // Not enough to deploy (cost 7)
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // With empty hand and not enough resources to deploy, leader should have no action
                expect(context.darthVader).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });

        describe('Darth Vader\'s leader unit side ability', function () {
            it('should deal damage equal to cards discarded when attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-vader#unstoppable', deployed: true },
                        hand: ['battlefield-marine', 'protector', 'pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.atst);

                // Select cards to discard from hand
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.protector, context.pykeSentinel]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.protector);
                context.player1.clickDone();

                // Should prompt to select a target for the damage
                expect(context.player1).toHavePrompt('Deal 2 damage to a unit or base');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.darthVader, context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.protector).toBeInZone('discard');
                expect(context.pykeSentinel).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow discarding all cards from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-vader#unstoppable', deployed: true },
                        hand: ['battlefield-marine', 'protector'],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.atst);

                // Select all cards to discard
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.protector);
                context.player1.clickDone();

                // Target selection
                context.player1.clickCard(context.p2Base);

                // Discarded 2 cards, should deal 2 damage to base
                expect(context.p2Base.damage).toBe(2);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.protector).toBeInZone('discard');
            });

            it('should allow choosing to discard no cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-vader#unstoppable', deployed: true },
                        hand: ['battlefield-marine', 'protector'],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.atst);

                // Choose to discard no cards
                context.player1.clickPrompt('Choose nothing');

                // Only combat damage (6), no ability damage
                expect(context.atst.damage).toBe(6);
                expect(context.p2Base.damage).toBe(0);
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.protector).toBeInZone('hand');
            });

            it('should work when attacking with empty hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-vader#unstoppable', deployed: true },
                        hand: [],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(6);
                expect(context.p2Base.damage).toBe(0);
            });
        });
    });
});
