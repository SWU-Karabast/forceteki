describe('Rey, In Balance', function () {
    integration(function (contextRef) {
        describe('Rey\'s undeployed ability', function () {
            it('should give an Experience token to a damaged unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rey#in-balance',
                        groundArena: [{ card: 'battlefield-marine', damage: 1 }, 'wampa'],
                        resources: 1,
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'grey-squadron-ywing', damage: 1 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rey);

                expect(context.player1).toHavePrompt('Give an Experience token to a damaged unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greySquadronYwing]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.rey.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            });

            it('should be usable when there is no damaged unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rey#in-balance',
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rey);
                expect(context.player1).toHaveEnabledPromptButtons(['Deploy Rey', '(No effect) Give an Experience token to a damaged unit']);
                context.player1.clickPrompt('(No effect) Give an Experience token to a damaged unit');
                context.player1.clickPrompt('Use it anyway');

                expect(context.rey.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames([]);
            });
        });

        describe('Rey\'s deployed ability', function () {
            it('should give an Experience token to a damaged unit on attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rey#in-balance', deployed: true },
                        groundArena: [{ card: 'battlefield-marine', damage: 1 }, 'wampa'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'awing', damage: 1 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rey);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.rey.exhausted).toBeTrue();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });

            it('should be able to give an Experience token to herself when damaged', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rey#in-balance', deployed: true, damage: 2 },
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.rey);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.rey]);
                context.player1.clickCard(context.rey);

                expect(context.rey).toHaveExactUpgradeNames(['experience']);
                expect(context.p2Base.damage).toBe(4);
            });
        });
    });
});
