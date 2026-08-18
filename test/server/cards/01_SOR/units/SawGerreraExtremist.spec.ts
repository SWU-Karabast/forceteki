describe('Saw Gerrera, Extremist', function () {
    integration(function (contextRef) {
        it('should add an additional cost (2 damage to base) to opponent\'s events', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['surprise-strike'],
                    groundArena: ['saw-gerrera#extremist'],
                },
                player2: {
                    hand: ['enforced-loyalty', 'vanquish', 'battlefield-marine'],
                    resources: ['smugglers-aid', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });
            const { context } = contextRef;

            // we play an event : nothing happen
            context.player1.clickCard(context.surpriseStrike);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(8); // 5+3

            // opponent play an event from smuggle : 2 damage on base
            context.player2.clickCard(context.smugglersAid);
            expect(context.p2Base.damage).toBe(7);
            context.setDamage(context.p2Base, 0);

            context.player1.passAction();

            // opponent play a unit : nothing happen
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('groundArena');
            expect(context.p2Base.damage).toBe(0);

            context.player1.passAction();

            // opponent play an event : 2 damage on base
            context.player2.clickCard(context.enforcedLoyalty);
            expect(context.p2Base.damage).toBe(2);
            expect(context.player2.hand.length).toBe(3);
            context.setDamage(context.p2Base, 0);

            context.player1.passAction();

            // opponent play an event and kill saw gerrera : 2 damage on base
            context.player2.clickCard(context.vanquish);
            // saw gerrera is automatically choose
            expect(context.p2Base.damage).toBe(2);
            expect(context.sawGerrera).toBeInZone('discard');
        });

        it('still applies its additional cost to a blanked opponent event (the cost is applied to the player, not the card)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['galen-erso#youll-never-win'],
                    groundArena: ['saw-gerrera#extremist', 'wampa'],
                    resources: 20
                },
                player2: {
                    hand: ['daring-raid'],
                    resources: 20
                }
            });

            const { context } = contextRef;

            // Galen (player1's) names Daring Raid, blanking it in player2's hand
            context.player1.clickCard(context.galenErso);
            context.player1.chooseListOption('Daring Raid');

            // player2 plays the blanked event: its own ability does nothing...
            context.player2.clickCard(context.daringRaid);
            context.player2.clickPrompt('Play anyway');
            expect(context.daringRaid).toBeInZone('discard');
            expect(context.wampa.damage).toBe(0);

            // ...but Saw Gerrera's additional cost is applied to the player, so it survives the blank
            expect(context.p2Base.damage).toBe(2);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
