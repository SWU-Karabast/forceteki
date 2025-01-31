
describe('Second Chance', function() {
    integration(function(contextRef) {
        describe('Second Chance\'s when defeated ability', function() {
            it('allows attached unit to be played for free from discard pile when defeated', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['second-chance', 'second-chance'],
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;
                const [secondChance1, secondChance2] = context.player1.findCardsByName('second-chance');

                // CASE 1: Second Chance can only be attached to non-leader units

                context.player1.clickCard(secondChance1);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['second-chance']);

                // CASE 2: When attached unit is defeated, that unit can be played from discard pile for free in the same phase

                // Defeat attached unit
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');

                // P1 plays Battlefield Marine from discard pile for free
                const readyResourceCount = context.player1.readyResourceCount;

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.readyResourceCount).toBe(readyResourceCount); // No resources spent

                // CASE 3: When attached unit is defeated, that unit cannot be played from discard pile for free in the next phase

                context.moveToNextActionPhase();

                // Attach Seecond Chance again
                context.player1.clickCard(secondChance2);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['second-chance']);

                // Defeat attached unit
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');

                context.moveToNextActionPhase();

                expect(context.battlefieldMarine).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('behaves correctly for more niche scenarios', function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['second-chance', 'second-chance'],
                        groundArena: ['battlefield-marine', 'escort-skiff', 'swoop-racer'],
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        groundArena: ['death-star-stormtrooper', 'atst']
                    }
                });

                const { context } = contextRef;
                const [secondChance1, secondChance2] = context.player1.findCardsByName('second-chance');

                // CASE 4: When attched to an opponent's unit, the opponent can play the unit from their discard pile for free

                context.player1.clickCard(secondChance1);
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper).toHaveExactUpgradeNames(['second-chance']);

                // Attack with Death Star Stormtrooper, defeating it
                context.player2.clickCard(context.deathStarStormtrooper);
                context.player2.clickCard(context.escortSkiff);

                // Death Star Stormtrooper is defeated and cannot be played by P1
                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.deathStarStormtrooper).not.toHaveAvailableActionWhenClickedBy(context.player1);

                context.player1.passAction();

                // P2 plays Death Star Stormtrooper from discard pile for free
                const p2ReadyResourceCount = context.player2.readyResourceCount;

                context.player2.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper).toBeInZone('groundArena');
                expect(context.player2.readyResourceCount).toBe(p2ReadyResourceCount); // No resources spent

                // CASE 5: When attached unit changes controller, only that unit's owner can play it from discard pile for free

                // Play Second Chance on Swoop Racer
                context.player1.clickCard(secondChance2);
                context.player1.clickCard(context.swoopRacer);

                expect(context.swoopRacer).toHaveExactUpgradeNames(['second-chance']);

                // Opponent takes control of Swoop Racer
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.swoopRacer);

                expect(context.swoopRacer).toHaveExactUpgradeNames(['second-chance']);

                // Escort Skiff attacks and defeats Swoop Racer
                context.player1.clickCard(context.escortSkiff);
                context.player1.clickCard(context.swoopRacer);

                expect(context.swoopRacer).toBeInZone('discard');
                expect(context.swoopRacer).not.toHaveAvailableActionWhenClickedBy(context.player2);

                context.player2.passAction();

                const p1ReadyResourceCount = context.player1.readyResourceCount;

                // P1 plays Swoop Racer from discard pile for free
                context.player1.clickCard(context.swoopRacer);

                expect(context.swoopRacer).toBeInZone('groundArena');
                expect(context.player1.readyResourceCount).toBe(p1ReadyResourceCount); // No resources spent
            });
        });
    });
});