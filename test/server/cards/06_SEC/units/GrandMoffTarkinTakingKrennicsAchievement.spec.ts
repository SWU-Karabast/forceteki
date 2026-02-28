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
            expect(context.getChatLog()).toEqual('player1 uses Grand Moff Tarkin to take control of AT-ST and to apply an effect that will give control to its owner when this unit leaves play');

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

        it('Grand Moff Tarkin ability should defeat a Vehicle that becomes a leader unit when he leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'darth-vader#victor-squadron-leader',
                    hand: ['grand-moff-tarkin#taking-krennics-achievement'],
                },
                player2: {
                    hand: ['vanquish'],
                    spaceArena: ['millennium-falcon#landos-pride'],
                },
            });

            const { context } = contextRef;

            // Player 1 plays Grand Moff Tarkin and takes control of Millennium Falcon
            context.player1.clickCard(context.grandMoffTarkin);
            context.player1.clickCard(context.millenniumFalcon);

            expect(context.millenniumFalcon).toBeInZone('spaceArena', context.player1);
            context.player2.passAction();

            // Player 1 deploys Darth Vader as a pilot to the Millennium Falcon, making it a leader unit
            context.player1.clickCard(context.darthVader);
            context.player1.clickPrompt('Deploy Darth Vader as a Pilot');
            context.player1.clickCard(context.millenniumFalcon);

            expect(context.millenniumFalcon).toHaveExactUpgradeNames(['darth-vader#victor-squadron-leader']);
            expect(context.millenniumFalcon.isLeader()).toBeTrue();

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.grandMoffTarkin);

            // Grand Moff Tarkin is defeated, Millennium Falcon is defeated (because it's a leader unit), Darth Vader returns to base
            expect(context.grandMoffTarkin).toBeInZone('discard', context.player1);
            expect(context.getChatLogs(1)).toContain('player2 would take control of Millennium Falcon, but it is a leader unit so it is defeated instead');
            expect(context.millenniumFalcon).toBeInZone('discard', context.player2);
            expect(context.darthVader).toBeInZone('base', context.player1);
            expect(context.darthVader.exhausted).toBeTrue();
        });
    });
});