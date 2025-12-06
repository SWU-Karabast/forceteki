describe('The Eye Of Aldhani', function() {
    integration(function(contextRef) {
        it('The Eye Of Aldhani\'s ability should trigger at the beginning of next action. Opponent must pay 1 resources for each unit he wants to keep ready', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-eye-of-aldhani'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['phoenix-squadron-awing'],
                },
                player2: {
                    groundArena: ['wampa', 'atst', 'specforce-soldier'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theEyeOfAldhani);

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.specforceSoldier);

            context.moveToRegroupPhase();

            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.player2).toHavePrompt('Select up to 3 units and pay 1 resource for each of them to keep them ready');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.awing]);
            expect(context.player2).toHaveChooseNothingButton();

            context.player2.clickCard(context.wampa);
            expect(context.player2).toHaveEnabledPromptButton('Done');
            context.player2.clickCard(context.atst);

            context.player2.clickDone();

            expect(context.player2.exhaustedResourceCount).toBe(2);
            expect(context.atst.exhausted).toBeFalse();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.awing.exhausted).toBeTrue();
            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.phoenixSquadronAwing.exhausted).toBeFalse();
        });

        it('The Eye Of Aldhani\'s ability should trigger at the beginning of next action. Opponent must pay 1 resources for each unit he wants to keep ready (he can choose nothing)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-eye-of-aldhani'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['phoenix-squadron-awing'],
                },
                player2: {
                    groundArena: ['wampa', 'atst', 'specforce-soldier'],
                    spaceArena: ['awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theEyeOfAldhani);

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.specforceSoldier);

            context.moveToRegroupPhase();

            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.player2).toHavePrompt('Select up to 3 units and pay 1 resource for each of them to keep them ready');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.awing]);
            expect(context.player2).toHaveChooseNothingButton();

            context.player2.clickPrompt('Choose nothing');

            expect(context.player2.exhaustedResourceCount).toBe(0);
            expect(context.atst.exhausted).toBeTrue();
            expect(context.wampa.exhausted).toBeTrue();
            expect(context.awing.exhausted).toBeTrue();
        });

        it('The Eye Of Aldhani\'s ability should trigger at the beginning of next action. Opponent must pay 1 resources for each unit he wants to keep ready (less resources than units)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-eye-of-aldhani'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['phoenix-squadron-awing'],
                },
                player2: {
                    groundArena: ['wampa', 'atst', 'yoda#old-master'],
                    spaceArena: ['awing'],
                    resources: 3
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theEyeOfAldhani);

            context.moveToRegroupPhase();

            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.player2).toHavePrompt('Select up to 3 units and pay 1 resource for each of them to keep them ready');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.awing, context.yoda]);

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.yoda);
            context.player2.clickCardNonChecking(context.awing);
            context.player2.clickDone();

            expect(context.player2.exhaustedResourceCount).toBe(3);
            expect(context.atst.exhausted).toBeFalse();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.yoda.exhausted).toBeFalse();
            expect(context.awing.exhausted).toBeTrue();
        });

        it('The Eye Of Aldhani\'s ability should trigger at the beginning of next action. Opponent must pay 1 resources for each unit he wants to keep ready (no units)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-eye-of-aldhani'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theEyeOfAldhani);

            context.moveToRegroupPhase();

            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.player1).toBeActivePlayer();
        });

        it('The Eye Of Aldhani\'s ability should trigger at the beginning of next action. Opponent must pay 1 resources for each unit he wants to keep ready (units has been played after event)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-eye-of-aldhani'],
                },
                player2: {
                    hand: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theEyeOfAldhani);
            context.player2.clickCard(context.wampa);

            context.moveToRegroupPhase();

            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.player2).toHavePrompt('Select up to 1 units and pay 1 resource for each of them to keep them ready');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa]);

            context.player2.clickCard(context.wampa);
            context.player2.clickDone();

            expect(context.player1).toBeActivePlayer();
            expect(context.player2.exhaustedResourceCount).toBe(1);
            expect(context.wampa.exhausted).toBeFalse();
        });

        it('The Eye Of Aldhani\'s ability should trigger at the beginning of next action. Opponent must pay 1 resources for each unit he wants to keep ready (2 events)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-eye-of-aldhani', 'the-eye-of-aldhani'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa', 'atst', 'yoda#old-master'],
                }
            });

            const { context } = contextRef;

            const aldhanis = context.player1.findCardsByName('the-eye-of-aldhani');

            context.player1.clickCard(aldhanis[0]);
            context.player2.passAction();
            context.player1.clickCard(aldhanis[1]);

            context.moveToRegroupPhase();

            context.player1.clickDone();
            context.player2.clickDone();

            expect(context.player2).toHavePrompt('Select up to 3 units and pay 1 resource for each of them to keep them ready');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.yoda]);

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.yoda);
            context.player2.clickDone();

            expect(context.player2.exhaustedResourceCount).toBe(3);

            expect(context.player2).toHavePrompt('Select up to 3 units and pay 1 resource for each of them to keep them ready');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.atst, context.yoda]);

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.yoda);
            context.player2.clickDone();

            expect(context.player2.exhaustedResourceCount).toBe(6);

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa.exhausted).toBeFalse();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.yoda.exhausted).toBeFalse();
        });
    });
});