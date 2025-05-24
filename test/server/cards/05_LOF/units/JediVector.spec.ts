describe('Jedi Vector', function () {
    integration(function (contextRef) {
        describe('Jedi Vector\'s ability', function () {
            it('should not give +1/+0 if it is the only Jedi unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['jedi-vector']
                    }
                });

                const { context } = contextRef;

                expect(context.jediVector.getPower()).toBe(1);
                expect(context.jediVector.getHp()).toBe(3);
            });

            it('should not give +1/+0 if only an enemy controls a Jedi unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['jedi-vector']
                    },
                    player2: {
                        groundArena: ['youngling-padawan']
                    }
                });

                const { context } = contextRef;

                expect(context.jediVector.getPower()).toBe(1);
                expect(context.jediVector.getHp()).toBe(3);
            });

            it('should give +1/+0 because a unit with Jedi trait is controlled by player', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['jedi-vector'],
                        groundArena: ['youngling-padawan']
                    }
                });

                const { context } = contextRef;

                expect(context.jediVector.getPower()).toBe(2);
                expect(context.jediVector.getHp()).toBe(3);
            });

            it('should not give +1/+0 if only an enemy controls a Lightsaber upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['jedi-vector']
                    },
                    player2: {
                        groundArena: [{ card: 'moisture-farmer', upgrades: ['jedi-lightsaber'] }]
                    }
                });

                const { context } = contextRef;

                expect(context.jediVector.getPower()).toBe(1);
                expect(context.jediVector.getHp()).toBe(3);
            });

            it('should give +1/+0 because a unit with Jedi trait is controlled by player', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['jedi-vector'],
                        groundArena: [{ card: 'moisture-farmer', upgrades: ['jedi-lightsaber'] }]
                    }
                });

                const { context } = contextRef;

                expect(context.jediVector.getPower()).toBe(2);
                expect(context.jediVector.getHp()).toBe(3);
            });

            it('should give +2/+0 if there is a friendly Jedi and a friendly Lightsaber', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['jedi-vector'],
                        groundArena: [{ card: 'youngling-padawan', upgrades: ['jedi-lightsaber'] }]
                    }
                });

                const { context } = contextRef;

                expect(context.jediVector.getPower()).toBe(3);
                expect(context.jediVector.getHp()).toBe(3);
            });
        });
    });
});
