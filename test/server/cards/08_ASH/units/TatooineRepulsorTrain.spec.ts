describe('Tatooine Repulsor Train', function () {
    integration(function (contextRef) {
        const cannotBeAttacked = (card: Card, game: Game) => {
            return card.getSummary(game.actionPhaseActivePlayer).cannotBeAttacked;
        };

        describe('Tatooine Repulsor Train\'s constant ability', function () {
            it('cannot be attacked while its controller controls 2 or more exhausted units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'tatooine-repulsor-train',
                            'battlefield-marine'
                        ],
                        spaceArena: [
                            { card: 'awing', exhausted: true },
                            { card: 'green-squadron-awing', exhausted: true }
                        ],
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.p1Base
                ]);
                expect(context.player2).not.toBeAbleToSelect(context.tatooineRepulsorTrain);
                expect(cannotBeAttacked(context.tatooineRepulsorTrain, context.game)).toBeTrue();

                context.player2.clickCard(context.battlefieldMarine);
            });

            it('can be attacked while its controller controls fewer than 2 exhausted units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'tatooine-repulsor-train',
                            'battlefield-marine'
                        ],
                        spaceArena: [{ card: 'awing', exhausted: true }],
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([
                    context.tatooineRepulsorTrain,
                    context.battlefieldMarine,
                    context.p1Base
                ]);
                expect(cannotBeAttacked(context.tatooineRepulsorTrain, context.game)).toBeFalse();

                context.player2.clickCard(context.tatooineRepulsorTrain);
            });
        });

        describe('Tatooine Repulsor Train\'s on attack ability', function () {
            it('deals 2 damage to a ground unit for each friendly exhausted unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'tatooine-repulsor-train',
                            { card: 'battlefield-marine', exhausted: true },
                            { card: 'wilderness-fighter', exhausted: true },
                            'echo-base-defender'
                        ],
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tatooineRepulsorTrain);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Choose a ground unit to deal 6 damage to');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.tatooineRepulsorTrain,
                    context.battlefieldMarine,
                    context.wildernessFighter,
                    context.echoBaseDefender,
                    context.wampa,
                    context.atst
                ]);
                expect(context.player1).not.toBeAbleToSelect(context.cartelSpacer);

                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(6);
            });
        });
    });
});
