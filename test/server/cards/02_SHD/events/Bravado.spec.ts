describe('Bravado', function () {
    integration(function (contextRef) {
        it('Bravado readies unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                    hand: ['bravado', 'takedown', 'power-of-the-dark-side', 'perilous-position', 'open-fire',
                        'strike-true', 'supreme-leader-snoke#shadow-ruler'],
                },
                player2: {
                    groundArena: ['rebel-pathfinder']
                }
            });

            const { context } = contextRef;

            const resetGameState = () => {
                if (context.battlefieldMarine.zoneName == 'discard') {
                    context.player1.moveCard(this.battlefieldMarine, 'groundArena');
                } else {
                    context.battlefieldMarine.removeDamage(3);
                }
                if (context.rebelPathfinder.zoneName == 'discard') {
                    context.player2.moveCard(context.rebelPathfinder, 'groundArena');
                } else {
                    context.rebelPathfinder.removeDamage(3);
                }
                resetBravado();
                // Jump back to action phase
                context.nextPhase();
                context.advancePhases('action');
                expect(context.player1.exhaustedResourceCount).toBe(0);
                // Don't let them die. Too many tests to run.
                context.p1Base.removeDamage(30);
                context.p2Base.removeDamage(30);
            };

            const resetBravado = () => {
                if (context.bravado.zoneName === 'discard') {
                    context.player1.moveCard(context.bravado, 'hand');
                }
                context.player1.readyResources(10);
            };

            // Case 1: No cost decrease
            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(5);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            context.player2.passAction();

            // CASE 2: Killing a unit when you attack counts as defeating it.
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.rebelPathfinder);

            context.player2.passAction();
            
            resetBravado();

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            resetGameState();

            // CASE 3: Killing a unit when attacked counts as defeating it.
            context.battlefieldMarine.exhausted = true;
            context.player1.passAction();

            context.player2.clickCard(context.rebelPathfinder);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            resetGameState();

            // CASE 4: Killing a unit via an event counts for events controller
            context.battlefieldMarine.exhausted = true;
            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.rebelPathfinder);

            context.player2.passAction();
            context.player1.readyResources(10);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            resetGameState();

            // CASE 5: Killing an enemy unit via an event counts for events controller even if they picked
            context.battlefieldMarine.exhausted = true;
            context.player1.clickCard(context.powerOfTheDarkSide);
            context.player2.clickCard(context.rebelPathfinder);

            context.player2.passAction();
            context.player1.readyResources(10);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            resetGameState();

            // CASE 6: Killing an enemy unit by event that damages
            context.battlefieldMarine.exhausted = true;
            context.player1.clickCard(context.openFire);
            context.player1.clickCard(context.rebelPathfinder);

            context.player2.passAction();
            context.player1.readyResources(10);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            resetGameState();

            // CASE 7: Killing an enemy unit by event has unit deal damage
            context.battlefieldMarine.exhausted = true;
            context.player1.clickCard(context.strikeTrue);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.rebelPathfinder);

            context.player2.passAction();
            context.player1.readyResources(10);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            resetGameState();

            // CASE 8: Killing an enemy unit by applying negative modifier
            context.battlefieldMarine.exhausted = true;
            context.setDamage(context.rebelPathfinder, 1)
            context.player1.clickCard(context.perilousPosition);
            context.player1.clickCard(context.rebelPathfinder);

            context.player2.passAction();
            context.player1.readyResources(10);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            resetGameState();

            // CASE 9: Killing an enemy unit by applying negative modifier with unit
            context.battlefieldMarine.exhausted = true;
            context.setDamage(context.rebelPathfinder, 1)
            context.player1.clickCard(context.supremeLeaderSnoke);

            context.player2.passAction();
            context.player1.readyResources(10);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            // TODO Current cases not covered:
            // 1. Bouncing a positive HP modifier resulting in unit being defeated.
            // 2. Cost reduction if Bravado smuggled
            // 3. Defeating HP modifying upgrade resulting in unit defeat.
            // 4. Oppenent triggering current tests doesn't trigger Bravado.
        });
    });
});