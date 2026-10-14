describe('Bug report game state serialization', function () {
    integration(function (contextRef) {
        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    discard: ['battlefield-marine', 'wampa', 'pyke-sentinel'],
                    deck: ['atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper', 'viper-probe-droid']
                },
                player2: {
                    discard: ['frontier-atrt']
                }
            });
        });

        it('should serialize the discard pile top card first, matching the setup format', function () {
            const { context } = contextRef;

            // the zone stores the top card last, the setup format lists it first
            expect(context.player1.discard[context.player1.discard.length - 1]).toBe(context.battlefieldMarine);

            const state = context.game.captureGameState(context.player1.id);

            expect(state.player1.discard).toEqual(['battlefield-marine', 'wampa', 'pyke-sentinel']);
            expect(state.player2.discard).toEqual(['frontier-atrt']);
        });

        it('should serialize a newly discarded card at the top of the discard pile', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.p2Base);

            const state = context.game.captureGameState(context.player1.id);

            expect(state.player1.discard).toEqual(['daring-raid', 'battlefield-marine', 'wampa', 'pyke-sentinel']);
        });

        it('should serialize the top five deck cards in setup order', function () {
            const { context } = contextRef;

            const state = context.game.captureGameState(context.player1.id);

            expect(state.player1.deck).toEqual(['atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper']);
        });

        it('should serialize cards without any other state as just their name', function () {
            const { context } = contextRef;

            const state = context.game.captureGameState(context.player1.id);

            expect(state.player1.leader).toBe(context.p1Leader.internalName);
            expect(state.player1.base).toBe(context.p1Base.internalName);
        });

        it('should serialize the reporting player as player1', function () {
            const { context } = contextRef;

            const state = context.game.captureGameState(context.player2.id);

            expect(state.player1.discard).toEqual(['frontier-atrt']);
            expect(state.player2.discard).toEqual(['battlefield-marine', 'wampa', 'pyke-sentinel']);
        });
    });

    integration(function (contextRef) {
        describe('with cards in different states', function () {
            const player1Setup = {
                leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                base: { card: 'echo-base', damage: 3 },
                groundArena: [
                    'wampa',
                    { card: 'battlefield-marine', damage: 1, exhausted: true, upgrades: ['academy-training'] }
                ],
                spaceArena: [{ card: 'cartel-spacer', exhausted: true }]
            };
            const player2Setup = {
                leader: { card: 'chancellor-palpatine#playing-both-sides', flipped: true, exhausted: true },
                base: 'chopper-base',
                groundArena: [{ card: 'seasoned-shoretrooper', capturedUnits: ['pyke-sentinel'] }]
            };

            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: player1Setup,
                    player2: player2Setup
                });
            });

            it('should serialize each card the same way the test setup describes it', function () {
                const { context } = contextRef;

                const state = context.game.captureGameState(context.player1.id);

                for (const [captured, setup] of [[state.player1, player1Setup], [state.player2, player2Setup]]) {
                    expect(captured.leader).toEqual(setup.leader);
                    expect(captured.base).toEqual(setup.base);
                    expect(captured.groundArena).toEqual(setup.groundArena);
                    expect(captured.spaceArena).toEqual(setup.spaceArena);
                }
            });
        });
    });
});
