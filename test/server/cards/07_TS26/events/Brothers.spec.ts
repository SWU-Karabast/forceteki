describe('Brothers', function () {
    integration(function (contextRef) {
        describe('Brothers\' ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['brothers'],
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid', 'battlefield-marine'],
                        spaceArena: ['mist-hunter#the-findsmans-pursuit'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer', 'awing']
                    }
                });
            });

            it('should initiate 2 attacks with combat prevention', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.brothers);
                expect(context.player1).toBeAbleToSelectExactly([context.mistHunter, context.grandInquisitor, context.chirrutImwe]);

                context.player1.clickCard(context.mistHunter);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.mistHunter.damage).toBe(0);
                expect(context.cartelSpacer).toBeInZone('discard');

                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickCard(context.wampa);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.wampa.damage).toBe(4);

                expect(context.player2).toBeActivePlayer();
            });

            it('should initiate only 1 attack with +1/+0', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.brothers);
                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickCard(context.wampa);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.wampa.damage).toBe(4);
                expect(context.player1).toBeAbleToSelectExactly([context.mistHunter, context.chirrutImwe]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should not be able to select the same unit for both attacks', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['brothers'],
                    groundArena: ['000#translation-and-torture', { card: 'sebulbas-podracer#taking-the-lead', upgrades: ['hans-golden-dice'] }],
                    deck: ['surprise-strike', 'echo#restored', 'green-squadron-awing', 'daring-raid', 'sudden-ferocity']
                },
                player2: {
                    discard: ['wolffe#suspicious-veteran']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.brothers);
            context.player1.clickCard(context.sebulbasPodracer);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Trigger');

            expect(context.sebulbasPodracer.exhausted).toBe(false);
            expect(context.player1).toBeAbleToSelectExactly(context._000);
            context.player1.clickCard(context._000);
            context.player1.clickCard(context.p2Base);
            expect(context.player2).toBeActivePlayer();
        });
    });
});