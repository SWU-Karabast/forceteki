
describe('Morgan Elsbeth, Following the Call', function() {
    integration(function (contextRef) {
        const prompt = 'Choose a friendly unit that attacked this phase';
        describe('Morgan Elsbeth\'s Leader side ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'swoop-racer',                   // No Keywords
                            'aurra-sing#patient-and-deadly', // Hidden, Raid 2
                            'independent-smuggler',          // Raid 1, Piloting
                            'timely-intervention',           // Smuggle
                        ],
                        groundArena: [
                            'warzone-lieutenant',   // No Keywords
                            'village-tender',       // Hidden, Restore 1
                        ],
                        spaceArena: [
                            'forged-starfighter',     // Hidden, Raid 1
                            'collections-starhopper' // Smuggle
                        ],
                        leader: 'morgan-elsbeth#following-the-call',
                        base: 'administrators-tower'
                    },
                    player2: {
                        groundArena: ['count-dooku#fallen-jedi'],
                        spaceArena: ['alliance-xwing', 'padawan-starfighter'],
                        hand: ['traitorous']
                    }
                });
            });

            it('does nothing if no unit attacked this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.morganElsbeth);

                // Select her Action ability
                expect(context.player1).toHaveEnabledPromptButton(prompt);
                context.player1.clickPrompt(prompt);
                context.player1.clickPrompt('Use it anyway');

                // It was used to no effect
                expect(context.morganElsbeth.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('does not allow playing a unit if there are no Keywords shared with the chosen unit', function () {
                const { context } = contextRef;

                // Attack with a unit that has no Keywords
                context.player1.clickCard(context.warzoneLieutenant);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Use Morgan Elsbeth's ability
                context.player1.clickCard(context.morganElsbeth);
                expect(context.player1).toHaveEnabledPromptButton(prompt);
                context.player1.clickPrompt(prompt);

                // It cannot fully resolve, so the user is prompted to confirm using it anyway
                expect(context.player1).toHavePrompt(`The ability "${prompt}" will have no effect. Are you sure you want to use it?`);
                context.player1.clickPrompt('Use it anyway');

                // Resolution ends because there are no valid units to play
                expect(context.morganElsbeth.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('allows playing a unit that shares a Keyword with the chosen unit', function () {
                const { context } = contextRef;

                // Attack with a unit that has Keywords
                context.player1.clickCard(context.forgedStarfighter);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Use Morgan Elsbeth's ability
                context.player1.clickCard(context.morganElsbeth);
                expect(context.player1).toHaveEnabledPromptButton(prompt);
                context.player1.clickPrompt(prompt);

                // Select a unit that attacked this phase
                expect(context.player1).toBeAbleToSelectExactly([context.forgedStarfighter]);
                context.player1.clickCard(context.forgedStarfighter);

                // Select a unit to play from hand that shares a Keyword
                expect(context.player1).toBeAbleToSelectExactly([
                    context.independentSmuggler,    // Raid in common
                    context.aurraSing               // Hidden, Raid in common
                ]);

                context.player1.clickCard(context.aurraSing);

                // The unit is played for 1 resource less and the Morgan Elsbeth is exhausted
                expect(context.aurraSing).toBeInZone('groundArena');
                expect(context.morganElsbeth.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('does not allow playing an event that shares a Keyword with the chosen unit', function () {
                const { context } = contextRef;

                // Attack with a unit that has Smuggle
                context.player1.clickCard(context.collectionsStarhopper);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Use Morgan Elsbeth's ability
                context.player1.clickCard(context.morganElsbeth);
                expect(context.player1).toHaveEnabledPromptButton(prompt);
                context.player1.clickPrompt(prompt);

                // It cannot fully resolve because there are no units with Smuggle in hand (only an event)
                expect(context.player1).toHavePrompt(`The ability "${prompt}" will have no effect. Are you sure you want to use it?`);
                context.player1.clickPrompt('Use it anyway');

                expect(context.morganElsbeth.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('does not allow playing a unit with Piloting as an upgrade', function () {
                const { context } = contextRef;

                // Attack with a unit that has Keywords
                context.player1.clickCard(context.forgedStarfighter);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Use Morgan Elsbeth's ability
                context.player1.clickCard(context.morganElsbeth);
                expect(context.player1).toHaveEnabledPromptButton(prompt);
                context.player1.clickPrompt(prompt);

                // Select a unit that attacked this phase
                expect(context.player1).toBeAbleToSelectExactly([context.forgedStarfighter]);
                context.player1.clickCard(context.forgedStarfighter);

                // Select a unit to play from hand that shares a Keyword
                expect(context.player1).toBeAbleToSelectExactly([
                    context.independentSmuggler,    // Raid in common
                    context.aurraSing               // Hidden, Raid in common
                ]);

                context.player1.clickCard(context.independentSmuggler);

                // It is played as a unit
                expect(context.player1).not.toHaveExactPromptButtons([
                    'Cancel',
                    'Play Independent Smuggler',
                    'Play Independent Smuggler with Piloting'
                ]);
                expect(context.independentSmuggler).toBeInZone('groundArena');
                expect(context.morganElsbeth.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Morgan Elsbeth\'s Leader Unit side On Attack ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'swoop-racer',                    // No Keywords
                            'independent-smuggler',           // Raid 1, Piloting
                            'aurra-sing#patient-and-deadly',  // Hidden, Raid 2,
                            'eye-of-sion#to-peridea',         // Hidden, Ambush, Overwhelm, Restore 1
                            'timely-intervention',            // Smuggle
                        ],
                        groundArena: [
                            'warzone-lieutenant',  // No Keywords
                            'village-tender'       // Hidden, Restore 1
                        ],
                        spaceArena: [
                            'forged-starfighter',      // Hidden, Raid 1
                            'collections-starhopper'  // Smuggle
                        ],
                        leader: {
                            card: 'morgan-elsbeth#following-the-call',
                            deployed: true
                        },
                        base: 'administrators-tower',
                        resources: [
                            'privateer-crew', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'
                        ]
                    }
                });
            });

            it('creates a lasting effect that reduces the cost of the next unit played this phase if it shares a Keyword with an in-play unit', function () {
                const { context } = contextRef;

                // Attack with Morgan Elsbeth to trigger the lasting effect
                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Play a unit that shares a Keyword with an in-play unit
                context.player1.clickCard(context.eyeOfSion);

                // It is played for 1 resource less
                expect(context.eyeOfSion).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(5);
                context.player2.passAction();

                // Play another unit that shares a Keyword with an in-play unit
                context.player1.clickCard(context.aurraSing);

                // Discount does not apply again because the effect only applies to the next unit played
                expect(context.aurraSing).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(7);
            });

            it('the effect does not give a discount if the played unit does not share a Keyword with an in-play unit', function () {
                const { context } = contextRef;

                // Attack with Morgan Elsbeth to trigger the lasting effect
                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Play a unit that does not share a Keyword with an in-play unit
                context.player1.clickCard(context.swoopRacer);

                // It is played without a discount
                expect(context.swoopRacer).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);
                context.player2.passAction();

                // Play a unit that does share a Keyword with an in-play unit
                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler');

                // It does not get a discount because the effect only applies to the next unit played
                expect(context.independentSmuggler).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('the effect expires at the end of the phase', function () {
                const { context } = contextRef;

                // Attack with Morgan Elsbeth to trigger the lasting effect
                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);

                context.moveToNextActionPhase();

                // Play a unit that shares a Keyword with an in-play unit
                context.player1.clickCard(context.eyeOfSion);

                // It is played without a discount because the effect expired
                expect(context.eyeOfSion).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });

            it('the effect gives a discount for units played using Smuggle', function () {
                const { context } = contextRef;

                // Attack with Morgan Elsbeth to trigger the lasting effect
                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Play a unit that shares a Keyword with an in-play unit using Smuggle
                context.player1.clickCard(context.privateerCrew);

                // It is played for 1 resource less
                expect(context.privateerCrew).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('the effect does not give a discount for event cards', function () {
                const { context } = contextRef;

                // Attack with Morgan Elsbeth to trigger the lasting effect
                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Play an event that shares a Keyword with an in-play unit
                context.player1.clickCard(context.timelyIntervention);
                context.player1.clickPrompt('Choose nothing');

                // It is played without a discount
                expect(context.timelyIntervention).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('the discount does not apply to units played from hand with Piloting', function () {
                const { context } = contextRef;

                // Attack with Morgan Elsbeth to trigger the lasting effect
                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Play a with Piloting that shares a Keyword with an in-play unit
                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler with Piloting');
                context.player1.clickCard(context.forgedStarfighter);

                // It is played as an upgrade, so the discount does not apply
                expect(context.forgedStarfighter).toHaveExactUpgradeNames(['independent-smuggler']);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('When the player has no ready resources', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'swoop-racer',                   // No Keywords
                            'independent-smuggler',          // Raid 1, Piloting
                            'aurra-sing#patient-and-deadly', // Hidden, Raid 2
                        ],
                        groundArena: [
                            'warzone-lieutenant',   // No Keywords
                            'village-tender',       // Hidden, Restore 1
                        ],
                        spaceArena: [
                            'forged-starfighter',    // Hidden, Raid 1
                        ],
                        leader: 'morgan-elsbeth#following-the-call',
                        base: 'administrators-tower',
                        resources: {
                            readyCount: 0,
                            exhaustedCount: 10
                        }
                    }
                });
            });

            it('the leader side ability can still be used if the discounted cost is 0', function () {
                const { context } = contextRef;

                expect(context.player1.readyResourceCount).toBe(0);

                // Attack with a unit that has Keywords
                context.player1.clickCard(context.forgedStarfighter);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Use Morgan Elsbeth's ability
                context.player1.clickCard(context.morganElsbeth);
                expect(context.player1).toHaveEnabledPromptButton(prompt);
                context.player1.clickPrompt(prompt);

                // Select a unit that attacked this phase
                expect(context.player1).toBeAbleToSelectExactly([context.forgedStarfighter]);
                context.player1.clickCard(context.forgedStarfighter);

                // Select a unit to play from hand that shares a Keyword
                expect(context.player1).toBeAbleToSelectExactly([context.independentSmuggler]);
                context.player1.clickCard(context.independentSmuggler);

                // The unit is played for 0 resources and Morgan Elsbeth is exhausted
                expect(context.independentSmuggler).toBeInZone('groundArena');
                expect(context.morganElsbeth.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('the leader unit side ability can still be used if the discounted cost is 0', function () {
                const { context } = contextRef;

                expect(context.player1.readyResourceCount).toBe(0);

                // Deploy Morgan Elsbeth
                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickPrompt('Deploy Morgan Elsbeth');
                expect(context.morganElsbeth).toBeInZone('groundArena');
                context.player2.passAction();

                // Attack with Morgan Elsbeth to trigger the lasting effect
                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Play a unit that shares a Keyword with an in-play unit
                context.player1.clickCard(context.independentSmuggler);

                // It is played for 0 resources
                expect(context.independentSmuggler).toBeInZone('groundArena');
            });
        });
    });
});