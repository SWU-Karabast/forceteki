describe('The Mandalorian, Sworn To The Creed', function () {
    integration(function (contextRef) {
        describe('The Mandalorian\'s leader undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['academy-training', 'waylay', 'devotion'],
                        groundArena: ['wampa'],
                        resources: ['armed-to-the-teeth', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        leader: 'the-mandalorian#sworn-to-the-creed',
                    },
                    player2: {
                        hand: ['vambrace-flamethrower'],
                        groundArena: ['academy-defense-walker', 'battlefield-marine', { card: 'consular-security-force', damage: 4 }],
                        spaceArena: ['green-squadron-awing']
                    },
                });
            });

            it('should exhaust a unit which cost 4 or less when playing upgrades', function () {
                const { context } = contextRef;

                // play an event : nothing happen
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // play a unit : nothing happen
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // play an upgrade from hand and pass
                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toHaveExactPromptButtons(['Pass', 'Exhaust this leader']);
                context.player1.clickPrompt('Pass');
                expect(context.theMandalorian.exhausted).toBeFalse();

                // opponent plays an upgrade, nothing happen
                context.player2.clickCard(context.vambraceFlamethrower);
                context.player2.clickCard(context.battlefieldMarine);

                // play an upgrade from smuggle, exhaust an enemy unit
                context.player1.clickCard(context.armedToTheTeeth);
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Exhaust this leader');

                // exhaust battlefield marine
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.consularSecurityForce]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.theMandalorian.exhausted).toBeTrue();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();

                // play an upgrade, as Mandalorian is exhaust nothing happen
                context.player2.passAction();
                context.player1.clickCard(context.devotion);
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('The Mandalorian\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['academy-training', 'devotion', 'waylay'],
                        groundArena: ['wampa'],
                        resources: ['armed-to-the-teeth', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        leader: { card: 'the-mandalorian#sworn-to-the-creed', deployed: true },
                    },
                    player2: {
                        hand: ['vambrace-flamethrower'],
                        groundArena: ['academy-defense-walker', 'blizzard-assault-atat', 'battlefield-marine', { card: 'consular-security-force', damage: 4 }],
                        spaceArena: ['green-squadron-awing']
                    },
                });
            });

            it('should exhaust a unit which cost 6 or less when playing upgrades', function () {
                const { context } = contextRef;

                // play an event : nothing happen
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // play a unit : nothing happen
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // play an upgrade from hand and exhaust a unit
                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.academyDefenseWalker, context.battlefieldMarine, context.greenSquadronAwing, context.consularSecurityForce]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.academyDefenseWalker);
                expect(context.theMandalorian.exhausted).toBeFalse();
                expect(context.academyDefenseWalker.exhausted).toBeTrue();

                // opponent plays an upgrade, nothing happen
                context.player2.clickCard(context.vambraceFlamethrower);
                context.player2.clickCard(context.battlefieldMarine);

                // play an upgrade from smuggle, exhaust an enemy unit
                context.player1.clickCard(context.armedToTheTeeth);
                context.player1.clickCard(context.wampa);

                // exhaust battlefield marine
                expect(context.player1).toBeAbleToSelectExactly([context.academyDefenseWalker, context.battlefieldMarine, context.greenSquadronAwing, context.consularSecurityForce]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.theMandalorian.exhausted).toBeFalse();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();

                // exhaust Mandalorian
                context.player2.passAction();
                context.player1.clickCard(context.theMandalorian);
                expect(context.theMandalorian.exhausted).toBeTrue();
                context.player2.passAction();

                // play an upgrade and exhaust a unit
                context.player1.clickCard(context.devotion);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.academyDefenseWalker, context.battlefieldMarine, context.greenSquadronAwing, context.consularSecurityForce]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
