describe('Camtono', function() {
    integration(function(contextRef) {
        it('Camtono\'s ability should play a unit if it costs 2 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['battlefield-marine', 'repair'],
                    groundArena: [{ card: 'wampa', upgrades: ['camtono'] }],
                },
                player2: {
                    deck: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.battlefieldMarine]);
            expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it for free', 'Leave it on top of your deck']);

            context.player1.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'play');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(0);
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
        });

        it('Camtono\'s ability should not trigger if top card costs more than 2', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['yoda#old-master'],
                    groundArena: [{ card: 'wampa', upgrades: ['camtono'] }],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.yoda]);
            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.deck[0]).toBe(context.yoda);
        });

        it('Camtono\'s ability should play an upgrade if it costs 2 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['protector'],
                    groundArena: [{ card: 'wampa', upgrades: ['camtono'] }],
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.protector]);
            expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it for free', 'Leave it on top of your deck']);

            context.player1.clickDisplayCardPromptButton(context.protector.uuid, 'play');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(0);
            expect(context.wampa).toHaveExactUpgradeNames(['camtono', 'protector']);
        });

        it('Camtono\'s ability should play an event if it costs 2 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['moment-of-peace'],
                    groundArena: [{ card: 'wampa', upgrades: ['camtono'] }],
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.momentOfPeace]);
            expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it for free', 'Leave it on top of your deck']);

            context.player1.clickDisplayCardPromptButton(context.momentOfPeace.uuid, 'play');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(0);
            expect(context.wampa).toHaveExactUpgradeNames(['camtono', 'shield']);
        });

        it('Camtono\'s ability should play a unit with Piloting if it costs 2 or less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['luke-skywalker#you-still-with-me'],
                    groundArena: [{ card: 'wampa', upgrades: ['camtono'] }],
                    spaceArena: ['awing']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.lukeSkywalker]);
            expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it for free', 'Leave it on top of your deck']);

            context.player1.clickDisplayCardPromptButton(context.lukeSkywalker.uuid, 'play');
            expect(context.player1).toHaveExactPromptButtons(['Play Luke Skywalker', 'Play Luke Skywalker with Piloting']);
            context.player1.clickPrompt('Play Luke Skywalker with Piloting');
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(0);
            expect(context.awing).toHaveExactUpgradeNames(['luke-skywalker#you-still-with-me']);
        });

        it('Camtono\'s ability should not do anything if deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: [],
                    groundArena: [{ card: 'wampa', upgrades: ['camtono'] }],
                    spaceArena: ['awing']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(0);
        });
    });
});
