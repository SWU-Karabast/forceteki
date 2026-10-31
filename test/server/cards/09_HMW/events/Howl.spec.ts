describe('Howl', function() {
    integration(function(contextRef) {
        it('Howl\'s ability should create a Beast token, then return an enemy non-leader unit to its owner\'s hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['howl'],
                    groundArena: ['atst'],
                    spaceArena: ['lurking-snub-fighter'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.howl);
            const p1Beast = context.player1.findCardByName('beast');
            expect(p1Beast).toBeInZone('groundArena', context.player1);

            expect(context.player1).toHavePrompt('Return a non-leader unit to its owner\'s hand');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, p1Beast, context.lurkingSnubFighter, context.battlefieldMarine, context.awing]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
            expect(context.atst).toBeInZone('groundArena', context.player1);
            expect(p1Beast).toBeInZone('groundArena', context.player1);
            expect(context.cadBane).toBeInZone('groundArena', context.player1);
            expect(context.lurkingSnubFighter).toBeInZone('spaceArena', context.player1);
            expect(context.awing).toBeInZone('hand', context.player2);
        });

        it('Howl\'s ability should create a Beast token, then return a friendly non-leader unit to its owner\'s hand, not choosing beast', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['howl'],
                    groundArena: ['atst'],
                    spaceArena: ['lurking-snub-fighter']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.howl);
            const p1Beast = context.player1.findCardByName('beast');
            expect(p1Beast).toBeInZone('groundArena', context.player1);

            expect(context.player1).toHavePrompt('Return a non-leader unit to its owner\'s hand');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, p1Beast, context.lurkingSnubFighter, context.battlefieldMarine, context.awing]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
            expect(context.atst).toBeInZone('hand', context.player1);
            expect(p1Beast).toBeInZone('groundArena', context.player1);
            expect(context.lurkingSnubFighter).toBeInZone('spaceArena', context.player1);
            expect(context.awing).toBeInZone('spaceArena', context.player2);
        });

        it('Howl\'s ability should create a Beast token, then return a friendly non-leader unit to its owner\'s hand, choosing beast', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['howl'],
                    groundArena: ['atst'],
                    spaceArena: ['lurking-snub-fighter']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.howl);
            const p1Beast = context.player1.findCardByName('beast');
            expect(p1Beast).toBeInZone('groundArena', context.player1);

            expect(context.player1).toHavePrompt('Return a non-leader unit to its owner\'s hand');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, p1Beast, context.lurkingSnubFighter, context.battlefieldMarine, context.awing]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(p1Beast);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
            expect(context.atst).toBeInZone('groundArena', context.player1);
            expect(p1Beast).not.toBeInZone('groundArena', context.player1);
            expect(p1Beast).not.toBeInZone('hand', context.player1);
            expect(context.lurkingSnubFighter).toBeInZone('spaceArena', context.player1);
            expect(context.awing).toBeInZone('spaceArena', context.player2);
        });
    });
});