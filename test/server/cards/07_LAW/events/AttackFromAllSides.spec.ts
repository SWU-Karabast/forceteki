describe('Attack From All Sides', function () {
    integration(function (contextRef) {
        it('should deal 3 damage a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['attack-from-all-sides'],
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

            context.player1.clickCard(context.attackFromAllSides);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.beilertValanceTargetVader, context.strafingGunship, context.ruthlessRaider]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.ruthlessRaider);

            expect(context.beilertValanceTargetVader.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });

        it('should have option to deal 3 or 5 damage if 4 or more aspects are among friendly units, choosing 3', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['attack-from-all-sides'],
                    groundArena: ['snowspeeder', 'beilert-valance#target-vader'],
                    spaceArena: ['strafing-gunship'],
                    resources: 20,
                },
                player2: {
                    groundArena: ['knight-of-ren'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.attackFromAllSides);

            expect(context.player1).toBeAbleToSelectExactly([context.knightOfRen, context.beilertValanceTargetVader, context.snowspeeder, context.strafingGunship, context.ruthlessRaider]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.knightOfRen);

            expect(context.player1).toHaveEnabledPromptButtons(['Deal 5 damage', 'Deal 3 damage']);
            context.player1.clickPrompt('Deal 3 damage');

            expect(context.beilertValanceTargetVader.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.knightOfRen.damage).toBe(3);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.snowspeeder.damage).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('should have option to deal 3 or 5 damage if 4 or more aspects are among friendly units, choosing 5', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['attack-from-all-sides'],
                    groundArena: ['snowspeeder', 'beilert-valance#target-vader'],
                    spaceArena: ['strafing-gunship'],
                    resources: 20,
                },
                player2: {
                    groundArena: ['knight-of-ren'],
                    spaceArena: ['ruthless-raider'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.attackFromAllSides);

            expect(context.player1).toBeAbleToSelectExactly([
                context.knightOfRen,
                context.beilertValanceTargetVader,
                context.snowspeeder,
                context.strafingGunship,
                context.ruthlessRaider,
                context.grandInquisitorHuntingTheJedi
            ]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.grandInquisitorHuntingTheJedi);

            expect(context.player1).toHaveEnabledPromptButtons(['Deal 5 damage', 'Deal 3 damage']);
            context.player1.clickPrompt('Deal 5 damage');

            expect(context.beilertValanceTargetVader.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.knightOfRen.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.snowspeeder.damage).toBe(0);
            expect(context.grandInquisitorHuntingTheJedi.damage).toBe(5);

            expect(context.player2).toBeActivePlayer();
        });
    });
});