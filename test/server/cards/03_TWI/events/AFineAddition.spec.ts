
describe('A Fine Addition', function () {
    integration(function (contextRef) {
        it('A Fine Addition\'s ability should play an upgrade from your hand or opponents discard, ignoring aspect penalty, if an enemy was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['a-fine-addition', 'ahsokas-padawan-lightsaber'],
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    groundArena: ['battlefield-marine', 'death-star-stormtrooper', 'snowspeeder'],
                    discard: ['lukes-lightsaber', 'specforce-soldier'],
                    base: 'dagobah-swamp' // blue aspect for fine addition
                },
                player2: {
                    hand: ['devotion', 'resilient'],
                    leader: { card: 'finn#this-is-a-rescue', deployed: true },
                    groundArena: ['wampa', 'criminal-muscle'],
                    discard: ['jedi-lightsaber', 'open-fire']
                }
            });

            const { context } = contextRef;

            // NO-OP play -- no enemy was defeated
            context.player1.clickCard(context.aFineAddition);
            context.player1.clickPrompt('Play anyway');
            expect(context.aFineAddition).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();

            // Restore for more testing
            context.player1.moveCard(context.aFineAddition, 'hand');

            // Now defeat an friendly unit to make sure it doesn't trigger opponent
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.deathStarStormtrooper);

            // should be another NO-OP play -- no enemy was defeated
            context.player1.clickCard(context.aFineAddition);
            context.player1.clickPrompt('Play anyway');
            expect(context.aFineAddition).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();

            // Restore for more testing
            context.player1.moveCard(context.aFineAddition, 'hand');

            context.player2.passAction();

            // Now defeat an enemy opponent
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.criminalMuscle);

            expect(context.criminalMuscle).toBeInZone('discard');

            // Add an upgrade to wampa for Finn's ability later
            context.player2.clickCard(context.resilient);
            context.player2.clickCard(context.wampa);

            context.player1.clickCard(context.aFineAddition);
            expect(context.player1.exhaustedResourceCount).toBe(0);

            // Select upgrade from opponents discard
            expect(context.player1).toBeAbleToSelectExactly([context.jediLightsaber, context.lukesLightsaber, context.ahsokasPadawanLightsaber]);
            context.player1.clickCard(context.jediLightsaber);

            // Select attachment target
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.finnThisIsARescue]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([context.jediLightsaber.internalName]);
            expect(context.player1.exhaustedResourceCount).toBe(3); // no aspect penalty applied

            context.player2.clickCard(context.finnThisIsARescue);
            context.player2.clickCard(context.p1Base);

            expect(context.player2).toHavePrompt('Defeat a friendly upgrade on a unit. If you do, give a Shield token to that unit');
            expect(context.player2).toBeAbleToSelectExactly([context.resilient]);

            context.player2.clickCard(context.resilient);

            // Restore for more testing
            context.player1.moveCard(context.aFineAddition, 'hand');

            context.player1.clickCard(context.aFineAddition);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            // Test player1's discard pile
            expect(context.player1).toBeAbleToSelectExactly([context.lukesLightsaber, context.ahsokasPadawanLightsaber, context.resilient]);
            context.player1.clickCard(context.lukesLightsaber);

            // Select attachment target
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.finnThisIsARescue]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([context.jediLightsaber.internalName, context.lukesLightsaber.internalName]);
            expect(context.player1.exhaustedResourceCount).toBe(5); // +2 for lukes lightsaber

            context.player2.passAction();

            // Restore for more testing
            context.player1.moveCard(context.aFineAddition, 'hand');

            context.player1.clickCard(context.aFineAddition);
            expect(context.player1.exhaustedResourceCount).toBe(5);

            // Test player1's hand
            expect(context.player1).toBeAbleToSelectExactly([context.ahsokasPadawanLightsaber, context.resilient]);
            context.player1.clickCard(context.ahsokasPadawanLightsaber);

            // Select attachment target
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.finnThisIsARescue]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([context.jediLightsaber.internalName, context.lukesLightsaber.internalName, context.ahsokasPadawanLightsaber.internalName]);
            expect(context.player1.exhaustedResourceCount).toBe(6); // +1 for lukes lightsaber
        });

        it('A Fine Addition\'s ability should play a pilot as an upgrade from your hand, ignoring aspect penalty, if an enemy was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'dagobah-swamp',
                    hand: ['a-fine-addition', 'vanquish', 'dagger-squadron-pilot'],
                    spaceArena: ['cartel-turncoat']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.wampa);
            context.player2.passAction();

            context.player1.clickCard(context.aFineAddition);
            expect(context.player1).toBeAbleToSelectExactly([context.daggerSquadronPilot]);
            context.player1.clickCard(context.daggerSquadronPilot);
            expect(context.player1).toBeAbleToSelectExactly([context.cartelTurncoat]);
            context.player1.clickCard(context.cartelTurncoat);
            expect(context.daggerSquadronPilot).toBeAttachedTo(context.cartelTurncoat);

            expect(context.player1.exhaustedResourceCount).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });

        it('A Fine Addition\'s ability should play a pilot as an upgrade from your discard, ignoring aspect penalty, if an enemy was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'dagobah-swamp',
                    hand: ['a-fine-addition', 'vanquish'],
                    discard: ['dagger-squadron-pilot'],
                    spaceArena: ['cartel-turncoat']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.wampa);
            context.player2.passAction();

            context.player1.clickCard(context.aFineAddition);
            expect(context.player1).toBeAbleToSelectExactly([context.daggerSquadronPilot]);
            context.player1.clickCard(context.daggerSquadronPilot);
            expect(context.player1).toBeAbleToSelectExactly([context.cartelTurncoat]);
            context.player1.clickCard(context.cartelTurncoat);
            expect(context.daggerSquadronPilot).toBeAttachedTo(context.cartelTurncoat);

            expect(context.player1.exhaustedResourceCount).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });

        it('A Fine Addition\'s ability should play a pilot as an upgrade from your opponent\'s discard, ignoring aspect penalty, if an enemy was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'dagobah-swamp',
                    hand: ['a-fine-addition', 'vanquish'],
                    spaceArena: ['cartel-turncoat']
                },
                player2: {
                    groundArena: ['wampa'],
                    discard: ['dagger-squadron-pilot'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.wampa);
            context.player2.passAction();

            context.player1.clickCard(context.aFineAddition);
            expect(context.player1).toBeAbleToSelectExactly([context.daggerSquadronPilot]);
            context.player1.clickCard(context.daggerSquadronPilot);
            expect(context.player1).toBeAbleToSelectExactly([context.cartelTurncoat]);
            context.player1.clickCard(context.cartelTurncoat);
            expect(context.daggerSquadronPilot).toBeAttachedTo(context.cartelTurncoat);

            expect(context.player1.exhaustedResourceCount).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });

        describe('Interaction with upgrades that have friendly unit restrictions', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'darth-vader#twilight-of-the-apprentice'
                        ],
                        hand: [
                            'takedown',
                            'a-fine-addition',
                        ],
                        resources: 7, // Enough to pay for Takedown (4) + Darth Maul's Lightsaber (3)
                        leader: 'mother-talzin#power-through-magick',
                        base: 'echo-base'
                    },
                    player2: {
                        leader: 'darth-maul#sith-revealed',
                        base: 'dagobah-swamp',
                        groundArena: [
                            'darth-maul#revenge-at-last',
                            'merrin#alone-with-the-dead'
                        ],
                        discard: [
                            'darth-mauls-lightsaber'
                        ]
                    }
                });
            });

            it('should be able to play an upgrade with a friendly unit restriction from an opponent\'s discard pile, ignoring aspect penalty', function () {
                const { context } = contextRef;

                // Defeat Merrin with Takedown
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.merrin);
                context.player2.passAction();

                expect(context.player1.exhaustedResourceCount).toBe(4);

                // Play A Fine Addition
                context.player1.clickCard(context.aFineAddition);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthMaulsLightsaber
                ]);

                // Play Darth Maul's Lightsaber on Darth Vader
                context.player1.clickCard(context.darthMaulsLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.darthVader]);
                context.player1.clickCard(context.darthVader);

                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.darthVader).toHaveExactUpgradeNames([
                    'darth-mauls-lightsaber'
                ]);
            });
        });
    });
});
