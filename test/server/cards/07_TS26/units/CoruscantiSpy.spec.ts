describe('Coruscanti Spy', function() {
    integration(function(contextRef) {
        it('Coruscanti Spy\'s when played ability should heal 2 damage from both bases', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['coruscanti-spy'],
                    base: { card: 'chopper-base', damage: 3 },
                },
                player2: {
                    hand: ['vanquish'],
                    base: { card: 'nadiri-dockyards', damage: 3 }
                }
            });

            const { context } = contextRef;

            // Assert the base is damaged
            expect(context.p1Base.damage).toBe(3);
            expect(context.p2Base.damage).toBe(3);

            // Trigger the play ability
            context.player1.clickCard(context.coruscantiSpy);

            // Assert the base is healed
            expect(context.player1).toHavePrompt('Choose bases to heal 2 damage from');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            context.player1.clickCard(context.p1Base);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Done');
            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(1);
        });

        it('Coruscanti Spy\'s when played ability should heal 2 damage from just p1Base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['coruscanti-spy'],
                    base: { card: 'chopper-base', damage: 3 },
                },
                player2: {
                    hand: ['vanquish'],
                    base: { card: 'nadiri-dockyards', damage: 3 }
                }
            });

            const { context } = contextRef;

            // Assert the base is damaged
            expect(context.p1Base.damage).toBe(3);
            expect(context.p2Base.damage).toBe(3);

            // Trigger the play ability
            context.player1.clickCard(context.coruscantiSpy);

            // Assert the base is healed
            expect(context.player1).toHavePrompt('Choose bases to heal 2 damage from');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            context.player1.clickCard(context.p1Base);
            context.player1.clickPrompt('Done');
            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(3);
        });

        it('Coruscanti Spy\'s when played ability should heal 2 damage from just p2Base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['coruscanti-spy'],
                    base: { card: 'chopper-base', damage: 3 },
                },
                player2: {
                    hand: ['vanquish'],
                    base: { card: 'nadiri-dockyards', damage: 3 }
                }
            });

            const { context } = contextRef;

            // Assert the base is damaged
            expect(context.p1Base.damage).toBe(3);
            expect(context.p2Base.damage).toBe(3);

            // Trigger the play ability
            context.player1.clickCard(context.coruscantiSpy);

            // Assert the base is healed
            expect(context.player1).toHavePrompt('Choose bases to heal 2 damage from');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Done');
            expect(context.p1Base.damage).toBe(3);
            expect(context.p2Base.damage).toBe(1);
        });

        it('Coruscanti Spy\'s when played ability should heal 2 damage from no base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['coruscanti-spy'],
                    base: { card: 'chopper-base', damage: 3 },
                },
                player2: {
                    hand: ['vanquish'],
                    base: { card: 'nadiri-dockyards', damage: 3 }
                }
            });

            const { context } = contextRef;

            // Assert the base is damaged
            expect(context.p1Base.damage).toBe(3);
            expect(context.p2Base.damage).toBe(3);

            // Trigger the play ability
            context.player1.clickCard(context.coruscantiSpy);

            // Assert the base is healed
            expect(context.player1).toHavePrompt('Choose bases to heal 2 damage from');
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            context.player1.clickPrompt('Choose nothing');
            expect(context.p1Base.damage).toBe(3);
            expect(context.p2Base.damage).toBe(3);
        });

        it('Coruscanti Spy\'s when played ability should still work if the base has no damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['coruscanti-spy'],
                    base: { card: 'chopper-base', damage: 0 },
                },
                player2: {
                    hand: ['vanquish'],
                    base: { card: 'nadiri-dockyards', damage: 0 }
                }
            });

            const { context } = contextRef;

            // Assert the base is damaged
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);

            // Trigger the play ability
            context.player1.clickCard(context.coruscantiSpy);

            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });
    });
});