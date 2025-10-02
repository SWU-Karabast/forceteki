describe('Disciples\' Devotion', function () {
    integration(function (contextRef) {
        describe('While attached unit is exhausted, it gains Sentinel', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bravado'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['disciples-devotion', 'shield'] }]
                    },
                    player2: {
                        hand: ['specforce-soldier'],
                        groundArena: ['wampa', 'atst'],
                    }
                });
            });

            it('does not grant Sentinel while the attached unit is ready', function () {
                const { context } = contextRef;

                expect(context.battlefieldMarine.exhausted).toBeFalse();
                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.battlefieldMarine]);
                context.player2.clickCard(context.p1Base);
            });

            it('grants Sentinel when the attached unit becomes exhausted', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.battlefieldMarine.exhausted).toBeTrue();

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);
            });

            it('loses Sentinel once the attached unit is readied again', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);

                // ready battlefield marine
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.atst);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });

            it('loses Sentinel with spec-force soldier ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.specforceSoldier);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});
