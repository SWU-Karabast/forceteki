describe('Beilert Valance, Target: Vader', function () {
    integration(function (contextRef) {
        it('should draw a card then deal 1 damage to an enemy ground unit on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['beilert-valance#target-vader'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'sly-moore#cipher-in-the-dark',
                    resources: 7,
                    deck: ['wampa']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.beilertValanceTargetVader);
            context.player1.clickCard(context.p2Base);
            expect(context.wampa).toBeInZone('hand');

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.beilertValanceTargetVader]);
            expect(context.player1).toHavePrompt('Deal 1 damage to a ground unit');
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.beilertValanceTargetVader.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.ruthlessRaider.damage).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('should deal 3 damage to a ground unit if 3 cards were drawn in 2 instances of draw', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['kiadimundi#we-must-push-on'],
                    groundArena: ['snowspeeder', 'beilert-valance#target-vader'],
                    spaceArena: ['strafing-gunship'],
                    resources: 20,
                    deck: ['confiscate', 'resupply', 'wampa'],
                    hasForceToken: true
                },
                player2: {
                    groundArena: ['knight-of-ren'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.kiadimundiWeMustPushOn);
            context.player1.clickPrompt('Trigger');

            context.player2.clickPrompt('Pass');

            context.player1.clickCard(context.beilertValanceTargetVader);
            context.player1.clickCard(context.p2Base);
            expect(context.wampa).toBeInZone('hand');

            expect(context.player1).toBeAbleToSelectExactly([context.knightOfRen, context.beilertValanceTargetVader, context.snowspeeder, context.kiadimundiWeMustPushOn]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.knightOfRen);

            expect(context.beilertValanceTargetVader.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.knightOfRen.damage).toBe(3);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.snowspeeder.damage).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['beilert-valance#target-vader'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'sly-moore#cipher-in-the-dark',
                    resources: 7,
                    deck: ['wampa']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.beilertValanceTargetVader);
            context.player1.clickCard(context.p2Base);
            expect(context.wampa).toBeInZone('hand');

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.beilertValanceTargetVader]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.beilertValanceTargetVader.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('should deal 3 damage to own base and 0 damage to a ground unit if deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['beilert-valance#target-vader'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'sly-moore#cipher-in-the-dark',
                    resources: 7,
                    deck: []
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.beilertValanceTargetVader);
            context.player1.clickCard(context.p2Base);

            expect(context.beilertValanceTargetVader.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.p1Base.damage).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });
    });
});