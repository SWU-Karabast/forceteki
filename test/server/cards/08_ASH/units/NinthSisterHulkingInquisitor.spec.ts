describe('Ninth Sister, Hulking Inquisitor', function () {
    integration(function (contextRef) {
        describe('Ninth Sister\'s When Played ability', function () {
            it('should force opponent to discard and allow distributing damage equal to cost among friendly and enemy units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ninth-sister#hulking-inquisitor'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['wampa'],
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Play Ninth Sister — opponent must discard a card
                context.player1.clickCard(context.ninthSister);
                expect(context.player2).toHavePrompt('Choose a card to discard for Ninth Sister\'s effect');
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');

                // wampa costs 4, distribute 4 damage among friendly (battlefieldMarine) and enemy (atst) units
                context.player1.clickPrompt('Trigger');
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.battlefieldMarine, 2],
                    [context.atst, 2]
                ]));

                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.atst.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal no damage when the player declines the optional damage step', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ninth-sister#hulking-inquisitor'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['wampa'],
                        groundArena: ['specforce-soldier']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ninthSister);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');

                // Decline optional damage
                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.specforceSoldier.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal no damage when opponent discards a 0-cost card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ninth-sister#hulking-inquisitor'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: ['porg'],
                        groundArena: ['specforce-soldier']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ninthSister);
                context.player2.clickCard(context.porg);
                expect(context.porg).toBeInZone('discard');

                // 0-cost card — decline the 0-damage trigger
                context.player1.clickPrompt('Pass');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.specforceSoldier.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing when opponent has no cards in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ninth-sister#hulking-inquisitor'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hand: [],
                        groundArena: ['specforce-soldier']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ninthSister);

                // No discard, no damage step
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.specforceSoldier.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
