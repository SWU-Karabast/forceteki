describe('Bravado', function () {
    integration(function (contextRef) {
        it('Bravado readies unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                    hand: ['bravado', 'takedown', 'power-of-the-dark-side', 'perilous-position', 'open-fire',
                        'strike-true', 'supreme-leader-snoke#shadow-ruler', 'waylay', 'confiscate', 'tech#source-of-insight'],
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    hand: ['general-dodonna#massassi-group-commander', 'jedi-lightsaber']
                }
            });

            const { context } = contextRef;

            const resetGameState = (player2Starts = false) => {
                if (context.battlefieldMarine.zoneName === 'discard') {
                    context.player1.moveCard(context.battlefieldMarine, 'groundArena');
                } else {
                    context.battlefieldMarine.removeDamage(3);
                }
                if (context.rebelPathfinder.zoneName === 'discard') {
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

                context.battlefieldMarine.exhausted = true;
                expect(context.battlefieldMarine.exhausted).toBe(true);

                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.battlefieldMarine.exhausted).toBe(false);

                resetBravado();

                context.battlefieldMarine.exhausted = true;
                expect(context.battlefieldMarine.exhausted).toBe(true);

                if (!player2Starts) {
                    context.player2.passAction();
                }
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

            resetGameState(true);

            // CASE 3: Killing a unit when attacked counts as defeating it.
            context.player2.clickCard(context.rebelPathfinder);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            resetGameState();

            // CASE 4: Killing a unit via an event counts for events controller
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
            context.setDamage(context.rebelPathfinder, 1);
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
            context.setDamage(context.rebelPathfinder, 1);
            context.player1.clickCard(context.supremeLeaderSnoke);

            context.player2.passAction();
            context.player1.readyResources(10);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            context.player1.moveCard(context.supremeLeaderSnoke, 'discard');

            resetGameState(true);

            // CASE 10: Bouncing an enemy lord that results in unit defeat
            // TODO this is currently leveraging active player, not player that removed the buff
            context.player2.clickCard(context.generalDodonna);

            context.setDamage(context.rebelPathfinder, 3);
            expect(context.rebelPathfinder).toBeInZone('groundArena');

            context.player1.clickCard(context.waylay);
            context.player1.clickCard(context.generalDodonna);
            expect(context.generalDodonna).toBeInZone('hand');
            expect(context.rebelPathfinder).toBeInZone('discard');

            context.player2.passAction();
            context.player1.readyResources(10);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            context.player2.moveCard(context.generalDodonna, 'discard');

            resetGameState(true);

            // CASE 12: Defeating enemy upgrade that results in unit defeat
            // TODO this is currently leveraging active player, not player that removed the buff
            context.player2.clickCard(context.jediLightsaber);
            context.player2.clickCard(context.rebelPathfinder);

            context.setDamage(context.rebelPathfinder, 3);
            expect(context.rebelPathfinder).toBeInZone('groundArena');

            context.player1.clickCard(context.confiscate);
            context.player1.clickCard(context.jediLightsaber);
            expect(context.jediLightsaber).toBeInZone('discard');
            expect(context.rebelPathfinder).toBeInZone('discard');

            context.player2.passAction();
            context.player1.readyResources(10);

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            context.player2.moveCard(context.generalDodonna, 'discard');

            resetGameState();

            // CASE 13: Smuggling also gets cost reduction
            context.player1.moveCard(context.bravado, 'resource');
            context.player1.readyResources(10);

            context.player1.clickCard(context.tech);

            context.player2.passAction();
            context.player1.readyResources(10);

            context.player1.moveCard(context.takedown, 'hand');
            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.rebelPathfinder);

            context.player2.passAction();
            context.player1.readyResources(10);

            // Currently needed due to bug where smuggling with empty deck
            // throws error when trying to replace the smuggle card.
            context.player1.moveCard(context.perilousPosition, 'deck');

            expect(context.battlefieldMarine.exhausted).toBe(true);
            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(5);
            expect(context.battlefieldMarine.exhausted).toBe(false);

            // TODO add test for 'A Fine Addition'
        });
    });
});