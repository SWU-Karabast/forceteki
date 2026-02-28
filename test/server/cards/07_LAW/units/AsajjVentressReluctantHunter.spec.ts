describe('Asajj Ventress, Reluctant Hunter', function() {
    integration(function(contextRef) {
        it('Asajj Ventress\' when played ability should ready another friendly Bounty Hunter', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['asajj-ventress#reluctant-hunter'],
                    groundArena: [{ card: 'boba-fett#disintegrator', exhausted: true }, 'bossk#deadly-stalker', 'wampa']
                },
                player2: {
                    groundArena: ['bail-organa#rebel-councilor', 'sundari-peacekeeper', 'zuckuss#bounty-hunter-for-hire'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.asajjVentress);
            expect(context.player1).toBeAbleToSelectExactly([context.bobaFett, context.bossk, context.zuckuss]);
            expect(context.player1).toHaveEnabledPromptButton('Pass');
            context.player1.clickCard(context.bobaFett);

            expect(context.bobaFett.exhausted).toBe(false);

            expect(context.player2).toBeActivePlayer();
        });

        it('Asajj Ventress\' when played ability should ready an enemy Bounty Hunter', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['asajj-ventress#reluctant-hunter'],
                    groundArena: [{ card: 'boba-fett#disintegrator', exhausted: true }, 'bossk#deadly-stalker', 'wampa']
                },
                player2: {
                    groundArena: ['bail-organa#rebel-councilor', 'sundari-peacekeeper', { card: 'zuckuss#bounty-hunter-for-hire', exhausted: true }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.asajjVentress);
            expect(context.player1).toBeAbleToSelectExactly([context.bobaFett, context.bossk, context.zuckuss]);
            expect(context.player1).toHaveEnabledPromptButton('Pass');
            context.player1.clickCard(context.zuckuss);

            expect(context.zuckuss.exhausted).toBe(false);

            expect(context.player2).toBeActivePlayer();
        });

        it('Asajj Ventress\' when played ability should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['asajj-ventress#reluctant-hunter'],
                    groundArena: [{ card: 'boba-fett#disintegrator', exhausted: true }, 'bossk#deadly-stalker', 'wampa']
                },
                player2: {
                    groundArena: ['bail-organa#rebel-councilor', 'sundari-peacekeeper', { card: 'zuckuss#bounty-hunter-for-hire', exhausted: true }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.asajjVentress);
            expect(context.player1).toBeAbleToSelectExactly([context.bobaFett, context.bossk, context.zuckuss]);
            expect(context.player1).toHaveEnabledPromptButton('Pass');
            context.player1.clickPrompt('Pass');

            expect(context.zuckuss.exhausted).toBe(true);
            expect(context.bobaFett.exhausted).toBe(true);

            expect(context.player2).toBeActivePlayer();
        });

        it('Asajj Ventress\' when played ability should ready a friendly Bounty Hunter leader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['asajj-ventress#reluctant-hunter'],
                    groundArena: [{ card: 'boba-fett#disintegrator', exhausted: true }, 'bossk#deadly-stalker', 'wampa'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true, exhausted: true },
                },
                player2: {
                    groundArena: ['bail-organa#rebel-councilor', 'sundari-peacekeeper', { card: 'zuckuss#bounty-hunter-for-hire', exhausted: true }],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.asajjVentress);
            context.player1.clickPrompt('Ready another Bounty Hunter unit');
            expect(context.player1).toBeAbleToSelectExactly([context.bobaFett, context.bossk, context.zuckuss, context.cadBane]);
            expect(context.player1).toHaveEnabledPromptButton('Pass');
            context.player1.clickCard(context.cadBane);
            context.player1.clickPrompt('Pass');

            expect(context.cadBane.exhausted).toBe(false);

            expect(context.player2).toBeActivePlayer();
        });
    });
});