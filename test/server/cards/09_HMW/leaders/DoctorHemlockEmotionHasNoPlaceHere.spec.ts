describe('Doctor Hemlock, Emotion Has No Place Here', () => {
    integration(function (contextRef) {
        const leaderPrompt = 'Give a Weakness token to a unit without a Weakness token on it';
        const unitPrompt = 'Give a Weakness token to a unit';

        describe('Hemlock\'s Leader side ability', function () {
            it('exhausts itself and pays 1 to give a Weakness token to a unit without a Weakness token on it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'doctor-hemlock#emotion-has-no-place-here',
                        resources: 4,
                        groundArena: [
                            'battlefield-marine',
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doctorHemlock);
                expect(context.player1).toHavePrompt(leaderPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.doctorHemlock.exhausted).toBeTrue();
                expect(context.player1.readyResourceCount).toBe(3);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
            });

            it('does not allow giving a Weakness token to a unit that already has one', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'doctor-hemlock#emotion-has-no-place-here',
                        resources: 4,
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['weakness'] }
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doctorHemlock);
                context.player1.clickPrompt('Use it anyway');

                // Ability was used
                expect(context.doctorHemlock.exhausted).toBeTrue();
                expect(context.player1.readyResourceCount).toBe(3);

                // No Weakness tokens were given, it is Player 2's turn
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
                expect(context.player2).toBeActivePlayer();
            });

            it('allows the player to give a Weakness token to an enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'doctor-hemlock#emotion-has-no-place-here',
                        resources: 4,
                        groundArena: [
                            'battlefield-marine'
                        ]
                    },
                    player2: {
                        groundArena: [
                            'consular-security-force',
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doctorHemlock);
                expect(context.player1).toHavePrompt(leaderPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.doctorHemlock.exhausted).toBeTrue();
                expect(context.player1.readyResourceCount).toBe(3);
                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['weakness']);
            });
        });

        describe('Hemlock\'s Unit side On Attack ability', function () {
            it('gives a Weakness token to a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'doctor-hemlock#emotion-has-no-place-here', deployed: true },
                        groundArena: [
                            'echo-base-defender'
                        ]
                    },
                    player2: {
                        groundArena: [
                            'consular-security-force',
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Doctor Hemlock
                context.player1.clickCard(context.doctorHemlock);
                context.player1.clickCard(context.p2Base);

                // Resolve ability
                expect(context.player1).toHavePrompt(unitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.consularSecurityForce, context.doctorHemlock]);
                expect(context.player1).toHaveEnabledPromptButtons(['Pass']);

                context.player1.clickCard(context.echoBaseDefender);

                expect(context.echoBaseDefender).toHaveExactUpgradeNames(['weakness']);
            });

            it('allows the player to pass the ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'doctor-hemlock#emotion-has-no-place-here', deployed: true },
                    },
                    player2: {
                        groundArena: [
                            { card: 'consular-security-force', upgrades: ['weakness'] }
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Doctor Hemlock
                context.player1.clickCard(context.doctorHemlock);
                context.player1.clickCard(context.p2Base);

                // Resolve ability
                expect(context.player1).toHavePrompt(unitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.doctorHemlock]);
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });

            it('should give Hemlock a Weakness token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'doctor-hemlock#emotion-has-no-place-here', deployed: true },
                    }
                });

                const { context } = contextRef;

                // Attack with Doctor Hemlock
                context.player1.clickCard(context.doctorHemlock);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.doctorHemlock]);
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                context.player1.clickCard(context.doctorHemlock);

                expect(context.doctorHemlock).toHaveExactUpgradeNames(['weakness']);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});