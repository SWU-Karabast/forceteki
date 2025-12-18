
describe('Doctor Aphra, Digging for Answers', function () {
    integration(function (contextRef) {
        it('should discard the top 3 cards of your deck and return an Underworld card discarded this way to your hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['doctor-aphra#digging-for-answers'],
                    discard: ['wampa', 'battlefield-marine', 'pirated-starfighter', 'force-throw'],
                    deck: ['ma-klounkee', 'porg', 'underworld-thug', 'moisture-farmer', 'tieln-fighter'],
                    resources: ['resupply']
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.doctorAphraDiggingForAnswers);
            context.player1.clickCard(context.p2Base);

            expect(context.maKlounkee).toBeInZone('discard');
            expect(context.porg).toBeInZone('discard');
            expect(context.underworldThug).toBeInZone('discard');

            expect(context.player1).toHavePrompt('Return a discarded Underworld card to your hand');
            expect(context.player1).toHaveEnabledPromptButton('Pass');
            expect(context.player1).toBeAbleToSelectExactly([context.underworldThug, context.maKlounkee]);
            // Verify underworld cards already in discard are not selectable
            expect(context.player1).not.toBeAbleToSelect(context.piratedStarfighter);

            context.player1.clickCard(context.underworldThug);

            expect(context.underworldThug).toBeInZone('hand');
            expect(context.player2).toBeActivePlayer();
        });

        it('should allow the user not to select a discarded card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['doctor-aphra#digging-for-answers'],
                    discard: ['wampa', 'battlefield-marine', 'force-throw', 'pirated-starfighter'],
                    deck: ['ma-klounkee', 'porg', 'underworld-thug', 'moisture-farmer', 'tieln-fighter'],
                    resources: ['resupply']
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.doctorAphraDiggingForAnswers);
            context.player1.clickCard(context.p2Base);

            expect(context.maKlounkee).toBeInZone('discard');
            expect(context.porg).toBeInZone('discard');
            expect(context.underworldThug).toBeInZone('discard');

            expect(context.player1).toHavePrompt('Return a discarded Underworld card to your hand');
            expect(context.player1).toHaveEnabledPromptButton('Pass');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
        });

        it('should work if there are less than 3 cards to discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['doctor-aphra#digging-for-answers'],
                    discard: ['wampa', 'battlefield-marine', 'force-throw', 'pirated-starfighter'],
                    deck: ['underworld-thug', 'porg'],
                    resources: ['resupply']
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.doctorAphraDiggingForAnswers);
            context.player1.clickCard(context.p2Base);

            expect(context.porg).toBeInZone('discard');
            expect(context.underworldThug).toBeInZone('discard');

            expect(context.player1).toHavePrompt('Return a discarded Underworld card to your hand');
            expect(context.player1).toHaveEnabledPromptButton('Pass');
            expect(context.player1).toBeAbleToSelectExactly([context.underworldThug]);

            context.player1.clickCard(context.underworldThug);

            expect(context.underworldThug).toBeInZone('hand');
            expect(context.player2).toBeActivePlayer();
        });

        it('should move to next player\'s action if no underworld cards discarded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['doctor-aphra#digging-for-answers'],
                    discard: ['wampa', 'battlefield-marine', 'force-throw', 'pirated-starfighter'],
                    deck: ['porg', 'reinforcement-walker', 'moisture-farmer', 'tieln-fighter'],
                    resources: ['resupply']
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.doctorAphraDiggingForAnswers);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });
    });
});