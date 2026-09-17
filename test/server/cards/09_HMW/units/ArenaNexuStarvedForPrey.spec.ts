describe('Arena Nexu, Starved for Prey', function () {
    integration(function (contextRef) {
        it('Arena Nexu\'s on attack ability should deal 3 damage to another friendly creature unit and ready the Nexu', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'arena-nexu#starved-for-prey', 'krayt-dragon']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.arenaNexu);
            context.player1.clickCard(context.p2Base);

            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.arenaNexu, context.kraytDragon]);
            context.player1.clickCard(context.kraytDragon);

            expect(context.player2).toBeActivePlayer();
            expect(context.kraytDragon.damage).toBe(3);
            expect(context.arenaNexu.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.arenaNexu.exhausted).toBeFalse();

            context.player2.passAction();

            context.player1.clickCard(context.arenaNexu);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.kraytDragon.damage).toBe(3);
            expect(context.arenaNexu.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.arenaNexu.exhausted).toBeTrue();
        });

        it('Arena Nexu\'s on attack ability should deal 3 damage to itself and ready the Nexu', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'arena-nexu#starved-for-prey', 'krayt-dragon']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.arenaNexu);
            context.player1.clickCard(context.p2Base);

            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.arenaNexu, context.kraytDragon]);
            context.player1.clickCard(context.arenaNexu);

            expect(context.player2).toBeActivePlayer();
            expect(context.kraytDragon.damage).toBe(0);
            expect(context.arenaNexu.damage).toBe(3);
            expect(context.wampa.damage).toBe(0);
            expect(context.arenaNexu.exhausted).toBeFalse();
            expect(context.p2Base.damage).toBe(5);
        });

        it('Arena Nexu\'s on attack ability should deal 3 damage to another friendly creature unit and ready the Nexu even if the unit dies', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'arena-nexu#starved-for-prey', { card: 'krayt-dragon', damage: 7 }]
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.arenaNexu);
            context.player1.clickCard(context.p2Base);

            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.arenaNexu, context.kraytDragon]);
            context.player1.clickCard(context.kraytDragon);

            expect(context.player2).toBeActivePlayer();
            expect(context.kraytDragon).toBeInZone('discard');
            expect(context.arenaNexu.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.arenaNexu.exhausted).toBeFalse();
        });

        it('Arena Nexu\'s on attack ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'arena-nexu#starved-for-prey', { card: 'krayt-dragon', damage: 7 }]
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.arenaNexu);
            context.player1.clickCard(context.p2Base);

            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.kraytDragon.damage).toBe(7);
            expect(context.arenaNexu.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.arenaNexu.exhausted).toBeTrue();
        });

        it('Arena Nexu\'s on attack ability should ready it even if there are no creatures', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'arena-nexu#starved-for-prey', 'krayt-dragon']
                },
                player2: {
                    groundArena: ['the-first-legion#vaders-fist'],
                    spaceArena: ['cartel-spacer'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.theFirstLegion);
            context.player2.clickCard(context.p1Base);

            expect(context.player2).toHaveExactDropdownListOptions(context.getTraitNames());
            context.player2.chooseListOption('Creature');

            context.player1.clickCard(context.arenaNexu);
            context.player1.clickCard(context.p2Base);

            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.kraytDragon.damage).toBe(0);
            expect(context.arenaNexu.damage).toBe(0);
            expect(context.arenaNexu.exhausted).toBeFalse();
        });
    });
});