describe('Cad Bane, Still Faster Than You', function() {
    integration(function(contextRef) {
        describe('Leader side triggered ability', function() {
            it('should deal 1 damage to an enemy unit with 2 or more remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cad-bane#still-faster-than-you',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['wing-leader'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cadBane);
                context.player1.clickPrompt('Deal 1 damage to a unit with 2 or more remaining HP');

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.grandInquisitor]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.wingLeader).toBeInZone('spaceArena', context.player2);
                expect(context.cadBane.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to an enemy leader unit with 2 or more remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cad-bane#still-faster-than-you',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['wing-leader'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cadBane);
                context.player1.clickPrompt('Deal 1 damage to a unit with 2 or more remaining HP');

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.grandInquisitor]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.grandInquisitor);

                expect(context.atst.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.grandInquisitor.damage).toBe(1);
                expect(context.wingLeader).toBeInZone('spaceArena', context.player2);
                expect(context.cadBane.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to a friendly unit with 2 or more remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cad-bane#still-faster-than-you',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['wing-leader'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cadBane);
                context.player1.clickPrompt('Deal 1 damage to a unit with 2 or more remaining HP');

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.grandInquisitor]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.atst.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.wingLeader).toBeInZone('spaceArena', context.player2);
                expect(context.cadBane.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to a space unit with 2 or more remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cad-bane#still-faster-than-you',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        spaceArena: ['wing-leader', 'awing'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cadBane);
                context.player1.clickPrompt('Deal 1 damage to a unit with 2 or more remaining HP');

                expect(context.player1).toBeAbleToSelectExactly([context.awing, context.battlefieldMarine, context.grandInquisitor]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.awing);

                expect(context.awing.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.wingLeader).toBeInZone('spaceArena', context.player2);
                expect(context.cadBane.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to exhaust with no legal targets', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cad-bane#still-faster-than-you',
                    },
                    player2: {
                        spaceArena: ['wing-leader'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cadBane);
                context.player1.clickPrompt('(No effect) Deal 1 damage to a unit with 2 or more remaining HP');
                context.player1.clickPrompt('Use it anyway');

                expect(context.wingLeader).toBeInZone('spaceArena', context.player2);
                expect(context.cadBane.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Leader unit side on attack ability', function() {
            it('should deal 1 damage to an enemy unit with 2 or more remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['wing-leader'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });


                const { context } = contextRef;

                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.grandInquisitor, context.cadBane]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.cadBane.damage).toBe(0);
                expect(context.wingLeader).toBeInZone('spaceArena', context.player2);
                expect(context.cadBane.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to an enemy leader unit with 2 or more remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['wing-leader'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });


                const { context } = contextRef;

                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.grandInquisitor, context.cadBane]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.grandInquisitor);

                expect(context.atst.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.grandInquisitor.damage).toBe(1);
                expect(context.cadBane.damage).toBe(0);
                expect(context.wingLeader).toBeInZone('spaceArena', context.player2);
                expect(context.cadBane.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to a friendly unit with 2 or more remaining HP', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['wing-leader'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });


                const { context } = contextRef;

                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.grandInquisitor, context.cadBane]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.atst.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.cadBane.damage).toBe(0);
                expect(context.wingLeader).toBeInZone('spaceArena', context.player2);
                expect(context.cadBane.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to himself', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['wing-leader'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });


                const { context } = contextRef;

                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.grandInquisitor, context.cadBane]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.cadBane);

                expect(context.atst.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.cadBane.damage).toBe(1);
                expect(context.wingLeader).toBeInZone('spaceArena', context.player2);
                expect(context.cadBane.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to a space unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        spaceArena: ['wing-leader', 'awing'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });


                const { context } = contextRef;

                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.awing, context.battlefieldMarine, context.grandInquisitor, context.cadBane]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.awing);

                expect(context.awing.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.cadBane.damage).toBe(0);
                expect(context.wingLeader).toBeInZone('spaceArena', context.player2);
                expect(context.cadBane.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['wing-leader'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });


                const { context } = contextRef;

                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.grandInquisitor, context.cadBane]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');

                expect(context.atst.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.cadBane.damage).toBe(0);
                expect(context.wingLeader).toBeInZone('spaceArena', context.player2);
                expect(context.cadBane.exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});