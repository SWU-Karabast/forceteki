describe('Pelta Relief Frigate', function () {
    integration(function (contextRef) {
        it('should heal 2 damage from a friendly base and 2 damage from a friendly non leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pelta-relief-frigate'],
                    base: { card: 'theed-palace', damage: 3 },
                    groundArena: [{ card: 'opee-sea-killer', damage: 3 }],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 3 }
                },
                player2: {
                    base: { card: 'tarkintown', damage: 3 },
                    groundArena: [{ card: 'wampa', damage: 3 }],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true, damage: 3 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.peltaReliefFrigate);
            expect(context.player1).toBeAbleToSelectExactly([context.peltaReliefFrigate, context.opeeSeaKiller, context.grandInquisitor]);
            context.player1.clickCard(context.opeeSeaKiller);

            expect(context.peltaReliefFrigate.damage).toBe(0);
            expect(context.opeeSeaKiller.damage).toBe(1);
            expect(context.grandInquisitor.damage).toBe(3);
            expect(context.wampa.damage).toBe(3);
            expect(context.cadBane.damage).toBe(3);
            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('should heal 2 damage from a friendly base and 2 damage from a friendly leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pelta-relief-frigate'],
                    base: { card: 'theed-palace', damage: 3 },
                    groundArena: [{ card: 'opee-sea-killer', damage: 3 }],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 3 }
                },
                player2: {
                    base: { card: 'tarkintown', damage: 3 },
                    groundArena: [{ card: 'wampa', damage: 3 }],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true, damage: 3 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.peltaReliefFrigate);
            expect(context.player1).toBeAbleToSelectExactly([context.peltaReliefFrigate, context.opeeSeaKiller, context.grandInquisitor]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.grandInquisitor);

            expect(context.peltaReliefFrigate.damage).toBe(0);
            expect(context.opeeSeaKiller.damage).toBe(3);
            expect(context.grandInquisitor.damage).toBe(1);
            expect(context.wampa.damage).toBe(3);
            expect(context.cadBane.damage).toBe(3);
            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('should heal 2 damage from a friendly base even if the only friendly unit is Pelta', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pelta-relief-frigate'],
                    base: { card: 'theed-palace', damage: 3 },
                },
                player2: {
                    base: { card: 'tarkintown', damage: 3 },
                    groundArena: [{ card: 'wampa', damage: 3 }],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true, damage: 3 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.peltaReliefFrigate);

            expect(context.peltaReliefFrigate.damage).toBe(0);
            expect(context.wampa.damage).toBe(3);
            expect(context.cadBane.damage).toBe(3);
            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('should heal 2 damage from a friendly unit even if base is undamaged', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pelta-relief-frigate'],
                    base: { card: 'theed-palace', damage: 0 },
                    groundArena: [{ card: 'opee-sea-killer', damage: 3 }],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 3 }
                },
                player2: {
                    base: { card: 'tarkintown', damage: 3 },
                    groundArena: [{ card: 'wampa', damage: 3 }],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true, damage: 3 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.peltaReliefFrigate);
            expect(context.player1).toBeAbleToSelectExactly([context.peltaReliefFrigate, context.opeeSeaKiller, context.grandInquisitor]);
            context.player1.clickCard(context.opeeSeaKiller);

            expect(context.peltaReliefFrigate.damage).toBe(0);
            expect(context.opeeSeaKiller.damage).toBe(1);
            expect(context.grandInquisitor.damage).toBe(3);
            expect(context.wampa.damage).toBe(3);
            expect(context.cadBane.damage).toBe(3);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });
    });
});