describe('Run Amok', function() {
    integration(function(contextRef) {
        it('Run Amok\'s ability should create a Beast token, deal 1 damage to a friendly ground unit and one to an enemy ground unit, not choosing Beast', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['run-amok'],
                    groundArena: ['atst'],
                    spaceArena: ['lurking-snub-fighter']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.runAmok);
            const p1Beast = context.player1.findCardByName('beast');
            expect(p1Beast).toBeInZone('groundArena', context.player1);

            expect(context.player1).toHavePrompt('Deal 1 damage to a friendly ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, p1Beast]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.atst);

            expect(context.player1).toHavePrompt('Deal 1 damage to an enemy ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.atst.damage).toBe(1);
            expect(p1Beast.damage).toBe(0);
            expect(context.lurkingSnubFighter.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
        });

        it('Run Amok\'s ability should create a Beast token, deal 1 damage to a friendly ground unit and one to an enemy ground unit, choosing Beast', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['run-amok'],
                    groundArena: ['atst'],
                    spaceArena: ['lurking-snub-fighter']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.runAmok);
            const p1Beast = context.player1.findCardByName('beast');
            expect(p1Beast).toBeInZone('groundArena', context.player1);

            expect(context.player1).toHavePrompt('Deal 1 damage to a friendly ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, p1Beast]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(p1Beast);

            expect(context.player1).toHavePrompt('Deal 1 damage to an enemy ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.atst.damage).toBe(0);
            expect(p1Beast.damage).toBe(1);
            expect(context.lurkingSnubFighter.damage).toBe(0);
            expect(context.awing.damage).toBe(0);
        });

        it('Run Amok\'s ability should create a Beast token and deal 1 damage to it if there are no other units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['run-amok']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.runAmok);
            const p1Beast = context.player1.findCardByName('beast');
            expect(p1Beast).toBeInZone('groundArena', context.player1);

            expect(context.player1).toHavePrompt('Deal 1 damage to a friendly ground unit');
            expect(context.player1).toBeAbleToSelectExactly([p1Beast]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(p1Beast);

            expect(context.player2).toBeActivePlayer();
            expect(p1Beast.damage).toBe(1);
        });
    });
});