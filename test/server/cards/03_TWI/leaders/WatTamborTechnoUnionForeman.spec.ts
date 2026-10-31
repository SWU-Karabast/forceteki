describe('Wat Tambor, Techno Union Foreman', function () {
    integration(function (contextRef) {
        describe('Wat Tambor\'s leader undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'guardian-of-the-whills'],
                        spaceArena: ['green-squadron-awing'],
                        leader: 'wat-tambor#techno-union-foreman',
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['admiral-yularen#advising-caution'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give +2/+2 to a unit this phase because a friendly unit was defeat this phase', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // yularen kill our guardian of the whills
                context.player2.clickCard(context.admiralYularen);
                context.player2.clickCard(context.guardianOfTheWhills);

                // wat tambor should give +2/+2 to any unit
                context.player1.clickCard(context.watTambor);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.admiralYularen]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                // give +2/+2 to battlefield marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);
                expect(context.watTambor.exhausted).toBeTrue();

                // kill yularen (5 hp)
                context.setDamage(context.admiralYularen, 0);
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.admiralYularen);
                expect(context.admiralYularen).toBeInZone('discard');

                // on next phase +2/+2 is gone
                context.moveToNextActionPhase();
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                context.player1.clickCard(context.watTambor);
                context.player1.clickPrompt('Use it anyway');

                // no friendly unit has died this phase, nothing happen
                expect(context.player2).toBeActivePlayer();
                expect(context.watTambor.exhausted).toBeTrue();
            });
        });

        describe('Wat Tambor\'s leader deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', 'guardian-of-the-whills'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'wat-tambor#techno-union-foreman', deployed: true },
                    },
                    player2: {
                        groundArena: ['admiral-yularen#advising-caution', 'alliance-dispatcher'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give +2/+2 to a unit for the phase because a friendly unit was defeat this phase', function () {
                const { context } = contextRef;

                // no unit killed, on attack ability should not trigger
                context.player1.clickCard(context.watTambor);
                context.player1.clickCard(context.allianceDispatcher);
                expect(context.player2).toBeActivePlayer();
                context.readyCard(context.watTambor);

                // yularen kill our guardian of the whills
                context.player2.clickCard(context.admiralYularen);
                context.player2.clickCard(context.guardianOfTheWhills);

                // wat tambor should give +2/+2 to any unit
                context.player1.clickCard(context.watTambor);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.admiralYularen]);
                expect(context.player1).toHavePassAbilityButton();

                // give +2/+2 to battlefield marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);

                // kill yularen (5 hp)
                context.setDamage(context.admiralYularen, 0);
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.admiralYularen);
                expect(context.admiralYularen).toBeInZone('discard');

                // on next phase +2/+2 is gone
                context.moveToNextActionPhase();
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });
        });

        it('Wat Tambor\'s leader undeployed ability should count an enemy unit taken and defeated with No Glory, Only Results as a friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'wat-tambor#techno-union-foreman',
                    hand: ['no-glory-only-results'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // player1 takes control of Wampa and defeats it, so it was a friendly unit when it was defeated
            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('discard', context.player2);

            context.player2.passAction();

            context.player1.clickCard(context.watTambor);
            context.player1.clickPrompt('If a friendly unit was defeated this phase, give a unit +2/+2 for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.getPower()).toBe(5);
            expect(context.battlefieldMarine.getHp()).toBe(5);
            expect(context.watTambor.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });
    });
});
