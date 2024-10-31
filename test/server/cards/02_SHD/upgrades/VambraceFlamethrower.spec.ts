describe('Vambrace Flamethrower', function () {
    integration(function (contextRef) {
        describe('Vambrace Flamethrower\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['vambrace-flamethrower'] }, 'wampa'],
                    },
                    player2: {
                        groundArena: ['atst', 'specforce-soldier'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should distribute damage among targets on attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.specforceSoldier]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.atst, 2],
                    [context.specforceSoldier, 1],
                ]));

                expect(context.atst.damage).toBe(2);
                expect(context.specforceSoldier.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to put all damage on a single target and exceed its HP total', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.specforceSoldier]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.specforceSoldier, 3],
                ]));

                expect(context.specforceSoldier.location).toBe('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
