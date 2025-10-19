describe('Clandestine Connections', function () {
    integration(function (contextRef) {
        it('Clandestine Connections On Attack ability should deal 2 damage to enemy base when triggered', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'rampaging-wampa', upgrades: ['clandestine-connections'] }],
                    spaceArena: ['awing'],
                    resources: 3,
                },
                player2: {
                    hand: ['change-of-heart'],
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rampagingWampa);
            context.player1.clickCard(context.battlefieldMarine);

            context.player1.clickPrompt('Trigger');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.rampagingWampa.damage).toBe(3);
            expect(context.atst.damage).toBe(4);
            expect(context.awing.damage).toBe(0);
            expect(context.avengerHuntingStarDestroyer.damage).toBe(0);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(2);
            expect(context.player1.exhaustedResourceCount).toBe(2);

            expect(context.player2).toBeActivePlayer();
        });

        it('Clandestine Connections On Attack ability should deal 2 damage to friendly base when triggered', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'rampaging-wampa', upgrades: ['clandestine-connections'] }],
                    spaceArena: ['awing'],
                    resources: 3,
                },
                player2: {
                    hand: ['change-of-heart'],
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rampagingWampa);
            context.player1.clickCard(context.battlefieldMarine);

            context.player1.clickPrompt('Trigger');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p1Base);

            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.rampagingWampa.damage).toBe(3);
            expect(context.atst.damage).toBe(4);
            expect(context.awing.damage).toBe(0);
            expect(context.avengerHuntingStarDestroyer.damage).toBe(0);
            expect(context.p1Base.damage).toBe(2);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(2);

            expect(context.player2).toBeActivePlayer();
        });

        it('Clandestine Connections On Attack ability should not trigger if there are not enough resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'rampaging-wampa', upgrades: ['clandestine-connections'] }],
                    spaceArena: ['awing'],
                    resources: 1,
                },
                player2: {
                    hand: ['change-of-heart'],
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rampagingWampa);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.rampagingWampa.damage).toBe(3);
            expect(context.atst.damage).toBe(4);
            expect(context.awing.damage).toBe(0);
            expect(context.avengerHuntingStarDestroyer.damage).toBe(0);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('Clandestine Connections On Attack ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'rampaging-wampa', upgrades: ['clandestine-connections'] }],
                    spaceArena: ['awing'],
                    resources: 3,
                },
                player2: {
                    hand: ['change-of-heart'],
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rampagingWampa);
            context.player1.clickCard(context.battlefieldMarine);

            context.player1.clickPrompt('Pass');

            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.rampagingWampa.damage).toBe(3);
            expect(context.atst.damage).toBe(4);
            expect(context.awing.damage).toBe(0);
            expect(context.avengerHuntingStarDestroyer.damage).toBe(0);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('Clandestine Connections On Attack ability should work if the unit changes control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'rampaging-wampa', upgrades: ['clandestine-connections'] }],
                    spaceArena: ['awing'],
                    resources: 1,
                },
                player2: {
                    hand: ['change-of-heart'],
                    groundArena: [{ card: 'atst', damage: 4 }, 'battlefield-marine'],
                    spaceArena: ['avenger#hunting-star-destroyer'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.rampagingWampa);

            context.player1.clickPrompt('Pass');

            context.player2.clickCard(context.rampagingWampa);
            context.player2.clickCard(context.p1Base);

            context.player2.clickPrompt('Trigger');
            context.player2.clickCard(context.p1Base);

            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.rampagingWampa.damage).toBe(0);
            expect(context.atst.damage).toBe(4);
            expect(context.awing.damage).toBe(0);
            expect(context.avengerHuntingStarDestroyer.damage).toBe(0);
            expect(context.p1Base.damage).toBe(9);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2.exhaustedResourceCount).toBe(8);

            expect(context.player1).toBeActivePlayer();
        });
    });
});