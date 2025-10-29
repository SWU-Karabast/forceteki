describe('Grand Moff Tarkin, Taking Krennic\'s Achievement', function() {
    integration(function(contextRef) {
        it('Grand Moff Tarkin ability should take control of a enemy Vehicle unit and give it back when he leaves play (defeated)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['grand-moff-tarkin#taking-krennics-achievement'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['vanquish'],
                    groundArena: ['atst', 'wampa'],
                    spaceArena: ['avenger#hunting-star-destroyer'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grandMoffTarkin);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.avenger]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toBeInZone('groundArena', context.player1);

            context.moveToNextActionPhase();
            expect(context.atst).toBeInZone('groundArena', context.player1);

            context.player1.passAction();
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.grandMoffTarkin);

            expect(context.player1).toBeActivePlayer();
            expect(context.grandMoffTarkin).toBeInZone('discard', context.player1);
            expect(context.atst).toBeInZone('groundArena', context.player2);
        });

        it('Grand Moff Tarkin ability should take control of a enemy Vehicle unit and give it back when he leaves play (bounced)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['grand-moff-tarkin#taking-krennics-achievement'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['atst'],
                    spaceArena: ['avenger#hunting-star-destroyer'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grandMoffTarkin);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.avenger]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toBeInZone('groundArena', context.player1);

            context.moveToNextActionPhase();
            expect(context.atst).toBeInZone('groundArena', context.player1);

            context.player1.passAction();
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.grandMoffTarkin);

            expect(context.player1).toBeActivePlayer();
            expect(context.grandMoffTarkin).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('groundArena', context.player2);
        });

        it('Grand Moff Tarkin ability should take control of a enemy Vehicle unit and give it back when he leaves play (change of heart and bounced)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['grand-moff-tarkin#taking-krennics-achievement'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['waylay', 'change-of-heart'],
                    groundArena: ['atst'],
                    spaceArena: ['avenger#hunting-star-destroyer'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grandMoffTarkin);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.avenger]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toBeInZone('groundArena', context.player1);

            context.moveToNextActionPhase();
            expect(context.atst).toBeInZone('groundArena', context.player1);

            context.player1.passAction();
            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.atst);
            expect(context.atst).toBeInZone('groundArena', context.player2);

            context.player1.passAction();

            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.grandMoffTarkin);

            expect(context.player1).toBeActivePlayer();
            expect(context.grandMoffTarkin).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('groundArena', context.player2);

            context.moveToNextActionPhase();

            expect(context.atst).toBeInZone('groundArena', context.player2);
        });

        it('Grand Moff Tarkin ability cannot target a Vehicle leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['grand-moff-tarkin#taking-krennics-achievement'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['waylay'],
                    groundArena: ['atst'],
                    spaceArena: ['avenger#hunting-star-destroyer'],
                    leader: { card: 'major-vonreg#red-baron' },
                    hasInitiative: true,
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.majorVonreg);
            context.player2.clickPrompt('Deploy Major Vonreg as a Pilot');
            context.player2.clickCard(context.avenger);

            context.player1.clickCard(context.grandMoffTarkin);
            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.atst);
        });
    });
});