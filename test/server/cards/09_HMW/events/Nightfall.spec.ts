describe('Nightfall', function() {
    integration(function(contextRef) {
        describe('Nightfall\'s ability', function() {
            it('should deal 1 damage to enemy unit but not trigger attack with no Endor base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nightfall'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['lurking-tie-phantom'],
                        base: 'shield-generator-complex'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.nightfall);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.lurkingTiePhantom]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(1);
                expect(context.lurkingTiePhantom.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
            });

            it('should deal 1 damage to an enemy unit and attack giving +2/+0 when you control an Endor base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nightfall'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        base: 'shield-generator-complex'
                    },
                    player2: {
                        groundArena: ['atst', 'village-tender']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.nightfall);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.villageTender]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.atst);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(1);
                expect(context.villageTender.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(5);
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should deal 1 damage to an enemy unit allow passing the attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nightfall'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        base: 'shield-generator-complex'
                    },
                    player2: {
                        groundArena: ['atst', 'village-tender']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.nightfall);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.villageTender]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.atst);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickPrompt('Choose nothing');

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(1);
                expect(context.villageTender.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should still attack giving +2/+0 when you control an Endor base and there are no enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nightfall'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        base: 'shield-generator-complex'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.nightfall);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(5);
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should still attack giving +2/+0 when you control an Endor base even if the damage is prevented', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nightfall'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        base: 'shield-generator-complex'
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['lurking-tie-phantom']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.nightfall);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.lurkingTiePhantom]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(0);
                expect(context.lurkingTiePhantom.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(5);
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });
        });
    });
});