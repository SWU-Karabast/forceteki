describe('Darth Nihilus, Lord of Hunger', function () {
    integration(function (contextRef) {
        it('When Played: should deal 3 damage to the unit with the least remaining HP among other units and give an Experience token if it\'s non-Vehicle', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['darth-nihilus#lord-of-hunger'],
                    groundArena: ['wampa'] // friendly non-vehicle with plenty of HP to avoid being the min
                },
                player2: {
                    groundArena: [
                        { card: 'battlefield-marine', damage: 2 }, // hp 3 -> remaining 1 (min, non-vehicle)
                        'atst' // vehicle with full hp -> not the min
                    ]
                }
            });

            const { context } = contextRef;

            // Play Darth Nihilus from hand
            context.player1.clickCard(context.darthNihilusLordOfHunger);

            // Should be asked to select the unit with the least remaining HP among other units
            // Only Battlefield Marine (remaining 1) should be selectable
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            // Battlefield Marine takes 3 damage and is defeated
            expect(context.battlefieldMarine).toBeInZone('discard');

            // Since target was non-Vehicle, Darth should gain an Experience token
            expect(context.darthNihilusLordOfHunger.upgrades.map((u) => u.internalName)).toContain('experience');
        });

        it('When Played: should not give an Experience token if the lowest HP target is a Vehicle', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['darth-nihilus#lord-of-hunger']
                },
                player2: {
                    groundArena: [
                        { card: 'atst', damage: 6 }, // hp 7 -> remaining 1 (min, vehicle)
                        'battlefield-marine' // hp 3 -> remaining 3
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthNihilusLordOfHunger);

            // Only the AT-ST (vehicle) with remaining 1 should be selectable
            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            context.player1.clickCard(context.atst);

            // AT-ST takes 3 damage and is defeated
            expect(context.atst).toBeInZone('discard');

            // Since target was a Vehicle, Darth should NOT gain an Experience token
            expect(context.darthNihilusLordOfHunger.upgrades.map((u) => u.internalName)).not.toContain('experience');
        });

        it('On Attack: should target a unit with the least remaining HP among other units; grant Experience only if non-Vehicle', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-nihilus#lord-of-hunger']
                },
                player2: {
                    groundArena: [
                        { card: 'battlefield-marine', damage: 2 }, // remaining 1 (non-vehicle)
                        { card: 'atst', damage: 6 } // remaining 1 (vehicle) -> tie; player chooses
                    ]
                }
            });

            const { context } = contextRef;

            // Start an attack with Darth to trigger the onAttack ability
            context.player1.clickCard(context.darthNihilusLordOfHunger);
            context.player1.clickCard(context.p2Base);

            // Both units tied at the lowest remaining HP should be selectable
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst]);

            // Choose the non-vehicle to verify Experience is granted
            context.player1.clickCard(context.battlefieldMarine);

            // Marine defeated by 3 damage
            expect(context.battlefieldMarine).toBeInZone('discard');
            // Darth gains Experience
            expect(context.darthNihilusLordOfHunger.upgrades.map((u) => u.internalName)).toContain('experience');
        });
    });
});
