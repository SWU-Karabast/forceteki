describe('Nien Nunb Loyal Co-Pilot', function () {
    integration(function (contextRef) {
        it('Nien Nunb Loyal Co-Pilot\'s ability should give +1/0 to himself for each other friendly Pilot upgrade and units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['nien-nunb#loyal-copilot', 'clone-pilot'],
                    spaceArena: [{ card: 'green-squadron-awing', upgrades: ['paige-tico#dropping-the-hammer'] }, 'blade-squadron-bwing'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: [{card: 'jedi-light-cruiser', upgrades: ['determined-recruit'] }], // make sure enemy pilots are not counted
                }
            });

            const { context } = contextRef;

            // Attack the base with a clone pilot and a pilot upgrade on the awing
            context.player1.clickCard(context.nienNunbLoyalCopilot);
            context.player1.clickCard(context.p2Base);

            // 1 for himself, 1 for Clone Pilot, 1 for Paige Tico
            expect(context.p2Base.damage).toBe(3);

            context.player2.passAction();

            context.player1.moveCard(context.nienNunbLoyalCopilot, 'hand');

            context.player1.clickCard(context.nienNunbLoyalCopilot);
            context.player1.clickPrompt('Play Nien Nunb with Piloting');
            context.player1.clickCard(context.bladeSquadronBwing);

            context.player2.passAction();

            context.player1.clickCard(context.bladeSquadronBwing);
            context.player1.clickCard(context.p2Base);

            // +3 for blade squadron b-wing, +1 for nien pilot upgrade, +1 for clone pilot, +1 for paige tico
            expect(context.p2Base.damage).toBe(9);

            context.player2.passAction();

            // Lets kill off some of the pilots and make sure the power level drops
            context.moveToNextActionPhase();

            context.player1.passAction();

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.clonePilot);

            // Intermediate check
            expect(context.bladeSquadronBwing.getPower()).toBe(5);

            context.player1.passAction();

            context.player2.clickCard(context.jediLightCruiser);
            context.player2.clickCard(context.greenSquadronAwing);

            // This should do 4 damage now
            context.player1.clickCard(context.bladeSquadronBwing);
            context.player1.clickCard(context.p2Base);

            // +3 for b-wing +1 for nien as an upgrade
            expect(context.p2Base.damage).toBe(13);
        });
    });
});
