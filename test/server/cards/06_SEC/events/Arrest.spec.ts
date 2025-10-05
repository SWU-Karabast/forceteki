// TODO: Enable these tests when we remove the overrideNotImplemented flag in Arrest.ts
xdescribe('Arrest', function() {
    integration(function(contextRef) {
        it('the player\'s base captures an enemy non-leader unit, which is then rescued at the start of the regroup phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arrest'],
                    groundArena: ['crafty-smuggler'],
                    spaceArena: ['cartel-spacer']
                },
                player2: {
                    leader: {
                        card: 'sabine-wren#galvanized-revolutionary',
                        deployed: true
                    },
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['yodas-lightsaber'] }],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            // Player 1 plays Arrest
            context.player1.clickCard(context.arrest);
            expect(context.player1).toHavePrompt('Your base captures an enemy non-leader unit');
            expect(context.player1).toBeAbleToSelectExactly([
                // Only enemy non-leader units are selectable
                context.battlefieldMarine,
                context.greenSquadronAwing
            ]);

            // Capture Battlefield Marine
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeCapturedBy(context.p1Base);
            expect(context.yodasLightsaber).toBeInZone('discard', context.player2);

            // Move to the regroup phase
            context.moveToRegroupPhase();

            // Battlefield Marine is rescued
            expect(context.p1Base.capturedUnits.length).toBe(0);
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.battlefieldMarine.upgrades.length).toBe(0);
        });

        it('the captured unit can be rescued by other means before the start of the regroup phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arrest'],
                },
                player2: {
                    hand: ['l337#droid-revolutionary'],
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            // Player 1 plays Arrest
            context.player1.clickCard(context.arrest);
            expect(context.player1).toHavePrompt('Your base captures an enemy non-leader unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

            // Capture Battlefield Marine
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeCapturedBy(context.p1Base);

            // Player 2 plays L3-37 to rescue the captured unit
            context.player2.clickCard(context.l337);
            expect(context.player2).toHavePrompt('Rescue a captured card. if you do not, give a Shield token to this unit');
            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.p1Base.capturedUnits.length).toBe(0);
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
            expect(context.battlefieldMarine.exhausted).toBeTrue();
        });

        it('can capture a stolen unit which will be returned to its owner when it is rescued', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arrest'],
                    groundArena: ['pyke-sentinel'],
                },
                player2: {
                    hand: ['change-of-heart'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Player 2 plays Change of Heart to steal Pyke Sentinel
            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.pykeSentinel);
            expect(context.pykeSentinel).toBeInZone('groundArena', context.player2);

            // Player 1 plays Arrest to capture the stolen Pyke Sentinel
            context.player1.clickCard(context.arrest);
            context.player1.clickCard(context.pykeSentinel);
            expect(context.pykeSentinel).toBeCapturedBy(context.p1Base);

            // Move to the regroup phase
            context.moveToRegroupPhase();

            // Pyke Sentinel is rescued and returned to Player 1
            expect(context.p1Base.capturedUnits.length).toBe(0);
            expect(context.pykeSentinel).toBeInZone('groundArena', context.player1);
            expect(context.pykeSentinel.exhausted).toBeTrue();
        });

        it('rescue targeting works correctly when multiple bases have captured units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arrest', 'l337#droid-revolutionary'],
                    groundArena: ['pyke-sentinel'],
                },
                player2: {
                    hand: ['arrest'],
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            // Player 1 plays Arrest to capture Battlefield Marine
            context.player1.clickCard(context.arrest);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeCapturedBy(context.p1Base);

            // Player 2 plays Arrest to capture Pyke Sentinel
            context.player2.clickCard(context.arrest);
            context.player2.clickCard(context.pykeSentinel);
            expect(context.pykeSentinel).toBeCapturedBy(context.p2Base);

            // Player 1 plays L3-37 to rescue a captured unit
            context.player1.clickCard(context.l337);
            expect(context.player1).toHavePrompt('Rescue a captured card. if you do not, give a Shield token to this unit');
            expect(context.player1).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.pykeSentinel
            ]);

            // Rescues Pyke Sentinel
            context.player1.clickCard(context.pykeSentinel);
            expect(context.p2Base.capturedUnits.length).toBe(0);
            expect(context.pykeSentinel).toBeInZone('groundArena', context.player1);
            expect(context.pykeSentinel.exhausted).toBeTrue();

            // Move to the regroup phase
            context.moveToRegroupPhase();

            // Battlefield Marine is rescued
            expect(context.p1Base.capturedUnits.length).toBe(0);
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
            expect(context.battlefieldMarine.exhausted).toBeTrue();
        });

        it('has no effect if there are no enemy non-leader units in play to capture', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arrest'],
                    groundArena: ['pyke-sentinel'],
                },
                player2: {
                    leader: {
                        card: 'sabine-wren#galvanized-revolutionary',
                        deployed: true
                    }
                }
            });

            const { context } = contextRef;

            // Player 1 plays Arrest
            context.player1.clickCard(context.arrest);

            expect(context.player1).toHaveNoEffectAbilityPrompt('Your base captures an enemy non-leader unit');
            context.player1.clickPrompt('Use it anyway');

            expect(context.player2).toBeActivePlayer();
        });
    });
});