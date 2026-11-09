describe('Darth Maul, Mechanism of Menace', function() {
    integration(function(contextRef) {
        describe('its leader side ability', function() {
            it('pays 1 resource, exhausts Maul, and deals 1 damage to a chosen unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-maul#mechanism-of-menace',
                        groundArena: ['battlefield-marine', 'wampa'],
                        spaceArena: ['awing'],
                        resources: 3
                    },
                    player2: {
                        groundArena: ['atst-raider']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthMaul);
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.atstRaider, context.awing]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.atstRaider);

                expect(context.darthMaul.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.atstRaider.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('is not available when there are no ready resources', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-maul#mechanism-of-menace',
                        groundArena: ['wampa'],
                        resources: {
                            readyCount: 0,
                            exhaustedCount: 3
                        }
                    },
                    player2: {
                        groundArena: ['atst-raider']
                    }
                });

                const { context } = contextRef;

                expect(context.darthMaul).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });

        describe('its leader unit side On Attack ability', function() {
            it('deals 1 damage to a chosen unit when attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-maul#mechanism-of-menace', deployed: true },
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['atst-raider']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.darthMaul, context.battlefieldMarine, context.atstRaider, context.awing]);
                context.player1.clickCard(context.atstRaider);

                expect(context.atstRaider.damage).toBe(1);
                expect(context.p2Base.damage).toBe(4);
                expect(context.darthMaul.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('can be declined and the attack still deals damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-maul#mechanism-of-menace', deployed: true }
                    },
                    player2: {
                        groundArena: ['atst-raider']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.atstRaider.damage).toBe(0);
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
