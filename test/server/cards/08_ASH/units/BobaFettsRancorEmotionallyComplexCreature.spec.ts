describe('Boba Fett\'s Rancor, Emotionally Complex Creature', function() {
    integration(function(contextRef) {
        it('should deal 5 damage to the base and 5 damage to an enemy ground unit, then another 5 to that same unit when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boba-fetts-rancor#emotionally-complex-creature'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst', 'battlefield-marine'],
                    spaceArena: ['awing'],
                    leader: { card: 'jabba-the-hutt#his-high-exaltedness', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettsRancor);
            expect(context.p1Base.damage).toBe(5);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.jabbaTheHutt]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.jabbaTheHutt);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(0);
            expect(context.jabbaTheHutt.damage).toBe(10);
            expect(context.wampa.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.bobaFettsRancor.damage).toBe(0);
        });

        it('should deal 5 damage to the base and 5 damage to an enemy ground unit, defeating it with the first damage when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boba-fetts-rancor#emotionally-complex-creature'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst', 'battlefield-marine'],
                    spaceArena: ['awing'],
                    leader: { card: 'jabba-the-hutt#his-high-exaltedness', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettsRancor);
            expect(context.p1Base.damage).toBe(5);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.jabbaTheHutt]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(0);
            expect(context.jabbaTheHutt.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            expect(context.awing.damage).toBe(0);
            expect(context.bobaFettsRancor.damage).toBe(0);
        });

        it('should deal 5 damage to the base and 5 damage to an enemy ground unit, then another 5 to that same unit, killing it when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boba-fetts-rancor#emotionally-complex-creature'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst', 'battlefield-marine'],
                    spaceArena: ['awing'],
                    leader: { card: 'jabba-the-hutt#his-high-exaltedness', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettsRancor);
            expect(context.p1Base.damage).toBe(5);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.jabbaTheHutt]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toBeInZone('discard', context.player2);
            expect(context.jabbaTheHutt.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
            expect(context.bobaFettsRancor.damage).toBe(0);
        });

        it('should deal 5 damage to the base with no enemy ground units when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boba-fetts-rancor#emotionally-complex-creature'],
                    groundArena: ['wampa']
                },
                player2: {
                    spaceArena: ['awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettsRancor);
            expect(context.p1Base.damage).toBe(5);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(0);
            expect(context.bobaFettsRancor.damage).toBe(0);
        });

        it('should deal 1 damage to the enemy base on attack for every 5 damage on its base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'boba-fetts-rancor#emotionally-complex-creature'],
                    base: { card: 'chopper-base', damage: 13 }
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    base: { card: 'nadiri-dockyards', damage: 20 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettsRancor);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePrompt('Deal 2 damage to a base');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.p2Base);

            expect(context.p1Base.damage).toBe(13);
            expect(context.p2Base.damage).toBe(22);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(0);
            expect(context.bobaFettsRancor.damage).toBe(3);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
        });

        it('should deal 1 damage to the friendly base on attack for every 5 damage on its base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'boba-fetts-rancor#emotionally-complex-creature'],
                    base: { card: 'chopper-base', damage: 13 }
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    base: { card: 'nadiri-dockyards', damage: 20 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettsRancor);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePrompt('Deal 2 damage to a base');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(15);
            expect(context.p2Base.damage).toBe(20);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(0);
            expect(context.bobaFettsRancor.damage).toBe(3);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
        });

        it('should be able to be passed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'boba-fetts-rancor#emotionally-complex-creature'],
                    base: { card: 'chopper-base', damage: 13 }
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    base: { card: 'nadiri-dockyards', damage: 20 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettsRancor);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePrompt('Deal 2 damage to a base');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.p1Base.damage).toBe(13);
            expect(context.p2Base.damage).toBe(20);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(0);
            expect(context.bobaFettsRancor.damage).toBe(3);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
        });
    });
});