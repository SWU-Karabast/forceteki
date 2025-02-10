describe('DeathSpace Skirmisher', function () {
    integration(function (contextRef) {
        it('DeathSpace Skirmisher\'s when played ability should exhaust a unit, If you control another space unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['death-space-skirmisher'],
                    groundArena: ['kylo-ren#killing-the-past'],
                    spaceArena: [{ card: 'kylos-tie-silencer#ruthlessly-efficient', damage: 1 }]
                },
                player2: {
                    hand: ['takedown'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            // Play Death Space Skirmisher, and exhaust a unit
            context.player1.clickCard(context.deathSpaceSkirmisher);
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.kyloRen, context.kylosTieSilencer, context.battlefieldMarine, context.greenSquadronAwing, context.deathSpaceSkirmisher]);


            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine.exhausted).toBe(true);

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.deathSpaceSkirmisher);
            context.player1.clickCard(context.kylosTieSilencer);
            context.player1.clickCard(context.greenSquadronAwing);

            context.player2.passAction();
            context.deathSpaceSkirmisher.moveTo('hand');
            context.player1.clickCard(context.deathSpaceSkirmisher);
            expect(context.deathSpaceSkirmisher).toBeInZone('spaceArena');
        });
    });
});
