describe('Mother Talzin, Stealing the Spirit', function() {
    integration(function(contextRef) {
        describe('Mother Talzin\'s when defeated ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'resupply'],
                        groundArena: ['mother-talzin#stealing-the-spirit'],
                        deck: ['wampa'],
                        leader: 'chewbacca#walking-carpet'
                    },
                    player2: {
                        hand: ['rivals-fall', 'no-glory-only-results', 'atst', 'mastery'],
                        deck: ['yoda#old-master', 'awing'],
                        leader: 'kylo-ren#rash-and-deadly',
                        base: 'colossus',
                        hasInitiative: true,
                    },
                });
            });

            it('should look at opponent hand, discard a card, make your opponent draw, and can play the discarded card from opponent discard ignoring its aspect penalties', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.motherTalzin);

                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.mastery, context.noGloryOnlyResults]);
                context.player1.clickCardInDisplayCardPrompt(context.atst);

                expect(context.player1).toBeActivePlayer();
                expect(context.atst).toBeInZone('discard', context.player2);
                expect(context.yoda).toBeInZone('hand', context.player2);
                expect(context.awing).toBeInZone('deck', context.player2);

                expect(context.atst).toHaveAvailableActionWhenClickedBy(context.player1);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });

            it('should look at opponent hand, discard a card, make your opponent draw, the discarded card is only playable for this phase', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.motherTalzin);

                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.mastery, context.noGloryOnlyResults]);
                context.player1.clickCardInDisplayCardPrompt(context.atst);

                expect(context.player1).toBeActivePlayer();
                expect(context.atst).toBeInZone('discard', context.player2);
                expect(context.yoda).toBeInZone('hand', context.player2);
                expect(context.awing).toBeInZone('deck', context.player2);

                context.moveToNextActionPhase();

                expect(context.atst).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should look at opponent hand, discard a card, make your opponent draw, the discarded card must be a unit to be playable from discard (upgrade)', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.motherTalzin);

                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.mastery, context.noGloryOnlyResults]);
                context.player1.clickCardInDisplayCardPrompt(context.mastery);

                expect(context.player1).toBeActivePlayer();
                expect(context.mastery).toBeInZone('discard', context.player2);
                expect(context.yoda).toBeInZone('hand', context.player2);
                expect(context.awing).toBeInZone('deck', context.player2);

                expect(context.mastery).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should look at opponent hand, discard a card, make your opponent draw, the discarded card must be a unit to be playable from discard (event)', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.motherTalzin);

                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.mastery, context.noGloryOnlyResults]);
                context.player1.clickCardInDisplayCardPrompt(context.noGloryOnlyResults);

                expect(context.player1).toBeActivePlayer();
                expect(context.noGloryOnlyResults).toBeInZone('discard', context.player2);
                expect(context.yoda).toBeInZone('hand', context.player2);
                expect(context.awing).toBeInZone('deck', context.player2);

                expect(context.noGloryOnlyResults).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should look at opponent hand and can choose nothing to discard', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.motherTalzin);

                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.atst, context.mastery, context.noGloryOnlyResults]);
                context.player1.clickPrompt('Take nothing');

                expect(context.player1).toBeActivePlayer();
                expect(context.atst).toBeInZone('hand', context.player2);
                expect(context.yoda).toBeInZone('deck', context.player2);
                expect(context.awing).toBeInZone('deck', context.player2);
            });

            it('should look at opponent hand, discard a card, make your opponent draw, and can play the discarded card from opponent discard ignoring its aspect penalties (No Glory Only Results)', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.motherTalzin);

                expect(context.player2).toHaveEnabledPromptButton('Take nothing');
                expect(context.player2).toHaveExactSelectableDisplayPromptCards([context.battlefieldMarine, context.resupply]);
                context.player2.clickCardInDisplayCardPrompt(context.battlefieldMarine);

                expect(context.player1).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.wampa).toBeInZone('hand', context.player1);

                context.player1.passAction();

                expect(context.battlefieldMarine).toHaveAvailableActionWhenClickedBy(context.player2);

                expect(context.player1).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
                expect(context.player2.exhaustedResourceCount).toBe(7); // 5+2
            });
        });


        it('Mother Talzin\'s ability should make opponent to draw, dealing 3 damage if deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['mother-talzin#stealing-the-spirit'],
                },
                player2: {
                    hand: ['rivals-fall', 'atst'],
                    deck: [],
                    hasInitiative: true,
                },
            });
            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.motherTalzin);

            context.player1.clickCardInDisplayCardPrompt(context.atst);

            expect(context.player1).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
        });
    });
});
