describe('Obi-Wan Kenobi, Protector of Felucia', function () {
    integration(function (contextRef) {
        describe('Obi-Wan\'s constant ability', function () {
            it('should make every friendly unit a 7/7 when there are 7 or more friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'echo-base-defender',
                            'obiwan-kenobi#protector-of-felucia',
                            'battlefield-marine',
                            'rebel-pathfinder'
                        ],
                        spaceArena: ['lurking-tie-phantom', 'cartel-spacer', 'green-squadron-awing'],
                    },
                    player2: {
                        spaceArena: ['distant-patroller'],
                        hand: ['fell-the-dragon'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                expect(context.echoBaseDefender.getPower()).toBe(7);
                expect(context.echoBaseDefender.getHp()).toBe(7);

                expect(context.obiwanKenobiProtectorOfFelucia.getPower()).toBe(7);
                expect(context.obiwanKenobiProtectorOfFelucia.getHp()).toBe(7);

                expect(context.battlefieldMarine.getPower()).toBe(7);
                expect(context.battlefieldMarine.getHp()).toBe(7);

                expect(context.rebelPathfinder.getPower()).toBe(7);
                expect(context.rebelPathfinder.getHp()).toBe(7);

                expect(context.lurkingTiePhantom.getPower()).toBe(7);
                expect(context.lurkingTiePhantom.getHp()).toBe(7);

                expect(context.cartelSpacer.getPower()).toBe(7);
                expect(context.cartelSpacer.getHp()).toBe(7);

                expect(context.greenSquadronAwing.getPower()).toBe(7);
                expect(context.greenSquadronAwing.getHp()).toBe(7);

                expect(context.distantPatroller.getPower()).toBe(2);
                expect(context.distantPatroller.getHp()).toBe(1);

                context.player2.clickCard(context.fellTheDragon);
                context.player2.clickCard(context.rebelPathfinder);

                expect(context.echoBaseDefender.getPower()).toBe(4);
                expect(context.echoBaseDefender.getHp()).toBe(3);

                expect(context.obiwanKenobiProtectorOfFelucia.getPower()).toBe(7);
                expect(context.obiwanKenobiProtectorOfFelucia.getHp()).toBe(7);

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                expect(context.lurkingTiePhantom.getPower()).toBe(2);
                expect(context.lurkingTiePhantom.getHp()).toBe(2);

                expect(context.cartelSpacer.getPower()).toBe(2);
                expect(context.cartelSpacer.getHp()).toBe(3);

                expect(context.greenSquadronAwing.getPower()).toBe(1);
                expect(context.greenSquadronAwing.getHp()).toBe(3);

                expect(context.distantPatroller.getPower()).toBe(2);
                expect(context.distantPatroller.getHp()).toBe(1);

                expect(context.player1).toBeActivePlayer();
            });

            it('size matters not in play first', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['obiwan-kenobi#protector-of-felucia'],
                        groundArena: [
                            { card: 'echo-base-defender', upgrades: ['size-matters-not'] },
                            'battlefield-marine',
                            'rebel-pathfinder'
                        ],
                        spaceArena: ['lurking-tie-phantom', 'cartel-spacer', 'green-squadron-awing'],
                    },
                    player2: {
                        spaceArena: ['distant-patroller'],
                        hand: ['fell-the-dragon'],
                    }
                });

                // TODO: We aren't exactly sure how this is meant to work and should be revisted pending clarification or CR7 update

                const { context } = contextRef;

                expect(context.echoBaseDefender.getPower()).toBe(5);
                expect(context.echoBaseDefender.getHp()).toBe(5);

                context.player1.clickCard(context.obiwanKenobiProtectorOfFelucia);

                expect(context.echoBaseDefender.getPower()).toBe(7);
                expect(context.echoBaseDefender.getHp()).toBe(7);

                expect(context.player2).toBeActivePlayer();
            });

            it('size matters not in play second', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['size-matters-not'],
                        groundArena: [
                            'echo-base-defender',
                            'battlefield-marine',
                            'obiwan-kenobi#protector-of-felucia',
                            'rebel-pathfinder'
                        ],
                        spaceArena: ['lurking-tie-phantom', 'cartel-spacer', 'green-squadron-awing'],
                    },
                    player2: {
                        spaceArena: ['distant-patroller'],
                        hand: ['fell-the-dragon'],
                    }
                });

                const { context } = contextRef;

                expect(context.echoBaseDefender.getPower()).toBe(7);
                expect(context.echoBaseDefender.getHp()).toBe(7);

                context.player1.clickCard(context.sizeMattersNot);
                context.player1.clickCard(context.echoBaseDefender);

                expect(context.echoBaseDefender.getPower()).toBe(5);
                expect(context.echoBaseDefender.getHp()).toBe(5);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});