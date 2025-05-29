
describe('Obi-Wan Kenobi, Courage Makes Heroes', () => {
    integration(function (contextRef) {
        const leaderPrompt = 'Give an Experience token to a unit without an Experience token on it';
        const unitPrompt = 'Give an Experience token to another unit without an Experience token on it';

        describe('Obi-Wan\'s Leader side ability', function () {
            it('exhausts itself and uses the Force to give an Experience token to a unit without an experience token on it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'obiwan-kenobi#courage-makes-heroes',
                        hasForceToken: true,
                        resources: 4,
                        groundArena: [
                            'battlefield-marine',
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.obiwanKenobi);
                expect(context.player1).toHavePrompt(leaderPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.obiwanKenobi.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            });

            it('does not allow giving an Experience token to a unit that already has one', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'obiwan-kenobi#courage-makes-heroes',
                        hasForceToken: true,
                        resources: 4,
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['experience'] }
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickPrompt('Use it anyway');

                // Ability was used
                expect(context.obiwanKenobi.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();

                // No Experience tokens were given, it is Player 2's turn
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('allows the player to give an Experience token to an enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'obiwan-kenobi#courage-makes-heroes',
                        hasForceToken: true,
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

                context.player1.clickCard(context.obiwanKenobi);
                expect(context.player1).toHavePrompt(leaderPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.obiwanKenobi.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['experience']);
            });
        });

        describe('Obi-Wan\'s Unit side On Attack ability', function () {
            it('gives an Experience token to another unit without an Experience token on it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'obiwan-kenobi#courage-makes-heroes', deployed: true },
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['experience'] },
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

                // Attack with Obi-Wan Kenobi
                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickCard(context.p2Base);

                // Resolve ability
                expect(context.player1).toHavePrompt(unitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.consularSecurityForce]);
                expect(context.player1).toHaveEnabledPromptButtons(['Pass']);

                context.player1.clickCard(context.echoBaseDefender);

                expect(context.echoBaseDefender).toHaveExactUpgradeNames(['experience']);
            });

            it('allows the player to pass the ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'obiwan-kenobi#courage-makes-heroes', deployed: true },
                    },
                    player2: {
                        groundArena: [
                            'consular-security-force'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Obi-Wan Kenobi
                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickCard(context.p2Base);

                // Resolve ability
                expect(context.player1).toHavePrompt(unitPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                expect(context.player1).toHaveEnabledPromptButton('Pass');

                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if there are no valid targets', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'obiwan-kenobi#courage-makes-heroes', deployed: true },
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['experience'] }
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack with Obi-Wan Kenobi
                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});