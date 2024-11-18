describe('Rey, More Than a Scavenger', function () {
    integration(function (contextRef) {
        describe('Rey\'s undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'rey#more-than-a-scavenger',
                        groundArena: ['battlefield-marine', 'partisan-insurgent'],
                        resources: 4,
                    },
                    player2: {
                        spaceArena: ['grey-squadron-ywing']
                    }
                });
            });

            it('should give an experience to a unit with 2 or less power', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rey);
                expect(context.player1).toBeAbleToSelectExactly([context.partisanInsurgent, context.greySquadronYwing]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.partisanInsurgent);

                expect(context.rey.exhausted).toBeTrue();
                expect(context.partisanInsurgent).toHaveExactUpgradeNames(['experience']);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('Rey\'s deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rey#more-than-a-scavenger', deployed: true },
                        groundArena: ['battlefield-marine', 'partisan-insurgent'],
                    },
                    player2: {
                        spaceArena: ['grey-squadron-ywing']
                    }
                });
            });

            it('should give an experience to a unit with 2 or less power', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rey);
                // need to order triggers between restore & on attack
                context.player1.clickPrompt('Give an Experience token to a unit with 2 or less power');
                expect(context.player1).toBeAbleToSelectExactly([context.rey, context.partisanInsurgent, context.greySquadronYwing]);
                context.player1.clickCard(context.partisanInsurgent);

                expect(context.rey.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(2);
                expect(context.rey.isUpgraded()).toBeFalse();
                expect(context.partisanInsurgent).toHaveExactUpgradeNames(['experience']);
                expect(context.player1.exhaustedResourceCount).toBe(0);

                // rey can give experience to herself
                context.rey.exhausted = false;
                context.setDamage(context.p2Base, 0);
                context.player2.passAction();
                context.player1.clickCard(context.rey);
                // need to order triggers between restore & on attack
                context.player1.clickPrompt('Give an Experience token to a unit with 2 or less power');
                expect(context.player1).toBeAbleToSelectExactly([context.rey, context.partisanInsurgent, context.greySquadronYwing]);
                context.player1.clickCard(context.rey);

                expect(context.rey.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(3);
                expect(context.rey).toHaveExactUpgradeNames(['experience']);
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });
        });

        describe('Rey\'s deployed ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rey#more-than-a-scavenger', deployed: true },
                        groundArena: ['battlefield-marine', 'partisan-insurgent'],
                        spaceArena: ['red-three#unstoppable']
                    },
                    player2: {
                        spaceArena: ['grey-squadron-ywing']
                    }
                });
            });

            it('should give an experience to a unit with 2 or less power (be careful Raid)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rey);
                // need to order triggers between restore & on attack
                context.player1.clickPrompt('Give an Experience token to a unit with 2 or less power');
                // rey should not be selectable because Red Three give her Raid 1
                expect(context.player1).toBeAbleToSelectExactly([context.redThree, context.partisanInsurgent, context.greySquadronYwing]);
                context.player1.clickCard(context.partisanInsurgent);

                expect(context.rey.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(3);
                expect(context.rey).toHaveExactUpgradeNames([]);
                expect(context.partisanInsurgent).toHaveExactUpgradeNames(['experience']);
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });
        });
    });
});
