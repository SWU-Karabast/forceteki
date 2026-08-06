describe('Yellow Aces bomber', function() {
    integration(function(contextRef) {
        it('should deal 2 damage to friendly base if attacking while upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'yellow-aces-bomber', upgrades: ['shield'] }],
                    groundArena: ['wampa']
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.yellowAcesBomber);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePrompt('Deal 2 damage to a base');
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(2);
            expect(context.p2Base.damage).toBe(2);

            expect(context.player2).toBeActivePlayer();
        });

        it('should deal 2 damage to enemy base if attacking while upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'yellow-aces-bomber', upgrades: ['shield'] }],
                    groundArena: ['wampa']
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.yellowAcesBomber);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePrompt('Deal 2 damage to a base');
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(4);

            expect(context.player2).toBeActivePlayer();
        });

        it('should not deal 2 damage to a base if attacking while not upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['yellow-aces-bomber'],
                    groundArena: ['wampa']
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.yellowAcesBomber);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).not.toHavePrompt('Deal 2 damage to a base');

            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(2);

            expect(context.player2).toBeActivePlayer();
        });

        it('should deal 2 damage to a base if attacking while upgraded with support', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['yellow-aces-bomber'],
                    groundArena: [{ card: 'wampa', upgrades: ['shield'] }]
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.yellowAcesBomber);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePrompt('Deal 2 damage to a base');
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(6);

            expect(context.player2).toBeActivePlayer();
        });

        it('should not deal 2 damage to a base if attacking while not upgraded with support', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['yellow-aces-bomber'],
                    groundArena: ['wampa']
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.yellowAcesBomber);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).not.toHavePrompt('Deal 2 damage to a base');

            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(4);

            expect(context.player2).toBeActivePlayer();
        });
    });
});