describe('Sword and Shield Maneuver', function () {
    integration(function (contextRef) {
        it('should give Raid 1 to each friendly Trooper and sentinel to each friendly Jedi', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sword-and-shield-maneuver'],
                    groundArena: ['death-trooper', 'plo-koon#kohtoyah', 'independent-senator', 'battlefield-marine'],
                    spaceArena: ['padawan-starfighter']
                },
                player2: {
                    groundArena: ['luke-skywalker#jedi-knight', 'specforce-soldier', 'wampa'],
                },
            });

            const { context } = contextRef;

            // Playing Sword and Shield Maneuver
            // Friendly Troopers should have Raid 1
            // Friendly Jedi should have sentinel
            context.player1.clickCard(context.swordAndShieldManeuver);
            expect(context.deathTrooper.hasSomeKeyword('raid')).toBe(true);
            expect(context.battlefieldMarine.hasSomeKeyword('raid')).toBe(true);
            expect(context.ploKoon.hasSomeKeyword('sentinel')).toBe(true);
            expect(context.independentSenator.hasSomeKeyword('sentinel')).toBe(false);
            expect(context.independentSenator.hasSomeKeyword('raid')).toBe(false);
            expect(context.padawanStarfighter.hasSomeKeyword('sentinel')).toBe(true);

            // Should not give it to enemy units
            expect(context.lukeSkywalker.hasSomeKeyword('sentinel')).toBe(false);
            expect(context.specforceSoldier.hasSomeKeyword('raid')).toBe(false);

            // Let's attack to verify raid 1
            context.player2.passAction();
            context.player1.clickCard(context.deathTrooper);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.lukeSkywalker, context.specforceSoldier, context.p2Base]);
            context.player1.clickCard(context.lukeSkywalker);
            expect(context.lukeSkywalker.damage).toBe(4);
            expect(context.deathTrooper).toBeInZone('discard');

            // Let's attack to verify sentinel
            context.player2.clickCard(context.wampa);
            expect(context.player2).toBeAbleToSelectExactly([context.ploKoon]);
            context.player2.clickCard(context.ploKoon);
            expect(context.wampa.damage).toBe(3);

            // It should stop at the end of the phase
            context.nextPhase();
            expect(context.ploKoon.hasSomeKeyword('sentinel')).toBe(false);
            expect(context.padawanStarfighter.hasSomeKeyword('sentinel')).toBe(false);
            expect(context.battlefieldMarine.hasSomeKeyword('raid')).toBe(false);
        });
    });
});
