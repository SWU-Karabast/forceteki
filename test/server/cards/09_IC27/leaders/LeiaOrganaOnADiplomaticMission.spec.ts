describe('Leia Organa, On a Diplomatic Mission', function () {
    integration(function (contextRef) {
        describe('Leia Organa\'s leader undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#on-a-diplomatic-mission',
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        hand: ['wampa'],
                    },
                });
            });

            it('should draw a card then put a card on top or bottom of deck (top)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1).toHaveEnabledPromptButtons(['Deploy Leia Organa', 'Draw a card, then put a card from your hand on the top or bottom of your deck']);
                context.player1.clickPrompt('Draw a card, then put a card from your hand on the top or bottom of your deck');
                expect(context.entrenched).toBeInZone('hand');

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.leiaOrgana.exhausted).toBeTrue();

                expect(context.player1).toHavePrompt('Select a card to put on the top or bottom of your deck');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.entrenched]);
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.entrenched);
                expect(context.player1).toHaveExactPromptButtons(['Top', 'Bottom']);
                context.player1.clickPrompt('Top');

                expect(context.player2).toBeActivePlayer();
                expect(context.entrenched).toBeInZone('deck');
                expect(context.player1.deck[0]).toBe(context.entrenched);
            });

            it('should draw a card then put a card on top or bottom of deck (bottom)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickPrompt('Draw a card, then put a card from your hand on the top or bottom of your deck');

                context.player1.clickCard(context.entrenched);
                context.player1.clickPrompt('Bottom');

                expect(context.entrenched).toBeInZone('deck');
                expect(context.entrenched).toBeInBottomOfDeck(context.player1, 1);
            });
        });

        it('Leia Organa\'s leader undeployed ability must put a card on top/bottom even if deck is empty and draw fails (should have 3 damage on base)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'leia-organa#on-a-diplomatic-mission',
                    hand: ['entrenched', 'r2d2#ignoring-protocol'],
                    deck: [],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.leiaOrgana);
            expect(context.player1).toHaveEnabledPromptButtons(['Deploy Leia Organa', 'Draw a card, then put a card from your hand on the top or bottom of your deck']);
            context.player1.clickPrompt('Draw a card, then put a card from your hand on the top or bottom of your deck');

            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.leiaOrgana.exhausted).toBeTrue();
            expect(context.p1Base.damage).toBe(3);

            expect(context.player1).toHavePrompt('Select a card to put on the top or bottom of your deck');
            expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.entrenched]);
            expect(context.player1).not.toHaveChooseNothingButton();

            // Select Card, Then Choose Top
            context.player1.clickCard(context.r2d2);
            expect(context.player1).toHaveExactPromptButtons(['Top', 'Bottom']);
            context.player1.clickPrompt('Bottom');
            expect(context.r2d2).toBeInZone('deck');
            expect(context.r2d2).toBeInBottomOfDeck(context.player1, 1);
        });

        describe('Leia Organa\'s leader deployed ability', function () {
            it('should draw a card then put a card on top/bottom of deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'leia-organa#on-a-diplomatic-mission', deployed: true },
                        deck: ['entrenched', 'r2d2#ignoring-protocol'],
                        hand: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.p2Base);

                expect(context.entrenched).toBeInZone('hand');

                expect(context.player1).toHavePrompt('Select a card to put on the top or bottom of your deck');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.entrenched]);
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.entrenched);
                expect(context.player1).toHaveExactPromptButtons(['Top', 'Bottom']);
                context.player1.clickPrompt('Top');

                expect(context.player2).toBeActivePlayer();
                expect(context.entrenched).toBeInZone('deck');
                expect(context.player1.deck[0]).toBe(context.entrenched);
            });

            it('must put a card on top/bottom even if deck is empty and draw fails (should have 3 damage on base)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'leia-organa#on-a-diplomatic-mission', deployed: true },
                        deck: [],
                        hand: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.player1).toHaveExactPromptButtons(['Top', 'Bottom']);

                context.player1.clickPrompt('Top');
                expect(context.wampa).toBeInZone('deck');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.deck[0]).toBe(context.wampa);
                expect(context.p1Base.damage).toBe(3);
            });
        });
    });
});
