describe('The Mandalorian, Weathered Pilot', function () {
    integration(function (contextRef) {
        describe('The Mandalorian\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-mandalorian#weathered-pilot'],
                        groundArena: ['liberated-slaves', 'republic-attack-pod'],
                        spaceArena: ['millennium-falcon#piece-of-junk']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'fleet-lieutenant', 'k2so#cassians-counterpart'],
                        spaceArena: ['green-squadron-awing', 'wing-leader']
                    }
                });
            });

            it('should exhaust up to 2 ground units when played as a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMandalorianWeatheredPilot);
                context.player1.clickPrompt('Play The Mandalorian');

                expect(context.player1).toHavePrompt('Exhaust up to 2 ground units');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.liberatedSlaves,
                    context.republicAttackPod,
                    context.theMandalorianWeatheredPilot,
                    context.battlefieldMarine,
                    context.fleetLieutenant,
                    context.k2soCassiansCounterpart
                ]);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.k2soCassiansCounterpart);
                context.player1.clickDone();

                expect(context.liberatedSlaves.exhausted).toBe(false);
                expect(context.republicAttackPod.exhausted).toBe(false);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.fleetLieutenant.exhausted).toBe(false);
                expect(context.k2soCassiansCounterpart.exhausted).toBe(true);
                expect(context.millenniumFalconPieceOfJunk.exhausted).toBe(false);
                expect(context.greenSquadronAwing.exhausted).toBe(false);
                expect(context.wingLeader.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust an enemy ground unit when played as a pilot on a ground vehicle', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMandalorianWeatheredPilot);
                context.player1.clickPrompt('Play The Mandalorian with Piloting');

                expect(context.player1).toHavePrompt('Attach The Mandalorian to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.republicAttackPod, context.millenniumFalconPieceOfJunk]);

                context.player1.clickCard(context.republicAttackPod);

                expect(context.player1).toHavePrompt('Exhaust an enemy unit in this arena');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.fleetLieutenant,
                    context.k2soCassiansCounterpart
                ]);

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.fleetLieutenant.exhausted).toBe(false);
                expect(context.k2soCassiansCounterpart.exhausted).toBe(false);
                expect(context.greenSquadronAwing.exhausted).toBe(false);
                expect(context.wingLeader.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust an enemy ground unit when played as a pilot on a space vehicle', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMandalorianWeatheredPilot);
                context.player1.clickPrompt('Play The Mandalorian with Piloting');

                expect(context.player1).toHavePrompt('Attach The Mandalorian to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.republicAttackPod, context.millenniumFalconPieceOfJunk]);

                context.player1.clickCard(context.millenniumFalconPieceOfJunk);

                expect(context.player1).toHavePrompt('Exhaust an enemy unit in this arena');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.greenSquadronAwing,
                    context.wingLeader
                ]);

                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.fleetLieutenant.exhausted).toBe(false);
                expect(context.k2soCassiansCounterpart.exhausted).toBe(false);
                expect(context.greenSquadronAwing.exhausted).toBe(true);
                expect(context.wingLeader.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('The Mandalorian\'s piloting ability, with another copy already in play (uniqueness rule),', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-mandalorian#weathered-pilot'],
                        groundArena: ['the-mandalorian#weathered-pilot'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;
                const copies = context.player1.findCardsByName('the-mandalorian#weathered-pilot');
                context.copyInHand = copies.find((copy) => copy.zoneName === 'hand');
                context.copyInPlay = copies.find((copy) => copy.zoneName === 'groundArena');
            });

            it('should exhaust nothing when the copy just played is the one defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.copyInHand);
                context.player1.clickPrompt('Play The Mandalorian with Piloting');
                context.player1.clickCard(context.tielnFighter);

                expect(context.player1).toHavePrompt('Choose which copy of The Mandalorian, Weathered Pilot to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.copyInHand, context.copyInPlay]);
                context.player1.clickCard(context.copyInHand);

                // When the ability resolves, the copy just played is attached to nothing and is in no arena, so there is
                // no enemy unit "in this arena" (read as the ruling of 2025-09-29 reads "attached unit"; no ruling covers this card)
                expect(context.copyInHand).toBeInZone('discard');
                expect(context.copyInPlay).toBeInZone('groundArena');
                expect(context.tielnFighter.isUpgraded()).toBe(false);
                expect(context.greenSquadronAwing.exhausted).toBe(false);
                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust an enemy unit in the arena of the vehicle it was played on when the copy already in play is the one defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.copyInHand);
                context.player1.clickPrompt('Play The Mandalorian with Piloting');
                context.player1.clickCard(context.tielnFighter);

                expect(context.player1).toHavePrompt('Choose which copy of The Mandalorian, Weathered Pilot to defeat');
                context.player1.clickCard(context.copyInPlay);

                expect(context.copyInPlay).toBeInZone('discard');
                expect(context.copyInHand).toBeAttachedTo(context.tielnFighter);
                expect(context.player1).toHavePrompt('Exhaust an enemy unit in this arena');
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing]);
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.greenSquadronAwing.exhausted).toBe(true);
                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});