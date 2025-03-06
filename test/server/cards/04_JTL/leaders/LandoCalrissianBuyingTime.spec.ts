describe('Lando Calrissian, Buying Time', function () {
    integration(function (contextRef) {
        describe('Lando Calrissian\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'lando-calrissian#buying-time',
                        hand: ['restored-arc170', 'kuiil#i-have-spoken'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['poe-dameron#quick-to-improvise'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should not give a shield as we do not control a unit in both arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.landoCalrissian);
                expect(context.player1).toBeAbleToSelectExactly([context.restoredArc170, context.kuiil]);
                context.player1.clickCard(context.kuiil);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.kuiil.isUpgraded()).toBeFalse();
            });

            it('should play a unit and give a shield because we control a unit in both arena', function () {
                const { context } = contextRef;

                // play a space unit
                context.player1.clickCard(context.restoredArc170);
                context.player2.passAction();

                context.player1.clickCard(context.landoCalrissian);
                context.player1.clickCard(context.kuiil);

                expect(context.player1).toBeAbleToSelectExactly([context.restoredArc170, context.kuiil, context.poeDameron, context.greenSquadronAwing]);
                context.player1.clickCard(context.kuiil);

                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.kuiil).toHaveExactUpgradeNames(['shield']);
            });
        });

        describe('Lando Calrissian\'s deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'lando-calrissian#buying-time',
                        groundArena: ['kuiil#i-have-spoken'],
                        spaceArena: ['restored-arc170'],
                    },
                    player2: {
                        groundArena: ['poe-dameron#quick-to-improvise'],
                        spaceArena: ['green-squadron-awing'],
                    }
                });
            });

            it('should give a shield to a unit in a different arena and give Sentinel to the attached unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.landoCalrissian);
                context.player1.clickPrompt('Deploy Lando Calrissian as a Pilot');
                context.player1.clickCard(context.restoredArc170);

                expect(context.player1).toBeAbleToSelectExactly([context.poeDameron, context.kuiil]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.kuiil);

                expect(context.player2).toBeActivePlayer();
                expect(context.kuiil).toHaveExactUpgradeNames(['shield']);

                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.player2).toBeAbleToSelectExactly([context.restoredArc170]);
                context.player2.clickCard(context.restoredArc170);

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});