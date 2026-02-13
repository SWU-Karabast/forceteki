describe('Savage Opress, You Must Have Your Revenge', function() {
    integration(function(contextRef) {
        describe('Savage Opress\' undeployed ability ', function() {
            it('should give the friendly unit with the most power Overwhelm', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'savage-opress#you-must-have-your-revenge',
                        groundArena: ['battlefield-marine', 'echo-base-defender'],
                    },
                    player2: {
                        groundArena: ['reinforcement-walker']
                    }
                });
                const { context } = contextRef;

                expect(context.echoBaseDefender.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.battlefieldMarine.hasSomeKeyword('overwhelm')).toBeFalse();
                expect(context.reinforcementWalker.hasSomeKeyword('overwhelm')).toBeFalse();

                expect(context.player1).toBeActivePlayer();
            });

            it('should give more than one friendly unit Overwhelm', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'savage-opress#you-must-have-your-revenge',
                        groundArena: ['battlefield-marine', 'echo-base-defender', 'escort-skiff'],
                    },
                    player2: {
                        groundArena: ['reinforcement-walker']
                    }
                });
                const { context } = contextRef;

                expect(context.echoBaseDefender.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.escortSkiff.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.battlefieldMarine.hasSomeKeyword('overwhelm')).toBeFalse();
                expect(context.reinforcementWalker.hasSomeKeyword('overwhelm')).toBeFalse();

                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Savage\'s deployed ability', function() {
            it('should give more than one friendly unit Overwhelm', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'savage-opress#you-must-have-your-revenge', deployed: true },
                        groundArena: ['battlefield-marine', 'echo-base-defender', 'escort-skiff'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['reinforcement-walker']
                    }
                });
                const { context } = contextRef;

                expect(context.echoBaseDefender.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.escortSkiff.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.battlefieldMarine.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.cartelSpacer.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.reinforcementWalker.hasSomeKeyword('overwhelm')).toBeFalse();

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});