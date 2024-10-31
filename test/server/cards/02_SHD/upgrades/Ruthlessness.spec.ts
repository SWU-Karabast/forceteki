describe('Ruthlessness', function() {
    integration(function(contextRef) {
        describe('Ruthlessness\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['ruthlessness'] }],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
            });

            it('should not deal 2 damage to base when not defeating a enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);

                expect(context.battlefieldMarine.location).toBe('discard');
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Ruthlessness\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['ruthlessness'] }],
                    },
                    player2: {
                        groundArena: ['specforce-soldier']
                    }
                });
            });

            it('should deal 2 damage to base when defeating a enemy unit (and survives)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.specforceSoldier);

                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.specforceSoldier.location).toBe('discard');
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Ruthlessness\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['ruthlessness'] }],
                    },
                    player2: {
                        groundArena: ['ardent-sympathizer']
                    }
                });
            });

            it('should deal 2 damage to base when defeating a enemy unit (and die)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.ardentSympathizer);

                expect(context.battlefieldMarine.location).toBe('discard');
                expect(context.ardentSympathizer.location).toBe('discard');
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
