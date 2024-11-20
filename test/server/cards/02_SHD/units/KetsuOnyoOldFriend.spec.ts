describe('Ketsu Onyo, Old friend', function() {
    integration(function(contextRef) {
        describe('Ketsu Onyo\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['guild-target'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['entrenched'] }, { card: 'ketsu-onyo#old-friend', upgrades: ['heroic-resolve'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }, { card: 'pyke-sentinel', upgrades: ['fallen-lightsaber'] }],
                        spaceArena: [{ card: 'imperial-interceptor', upgrades: ['academy-training'] }, 'mercenary-gunship'],
                        leader: { card: 'boba-fett#daimyo', deployed: true },
                        base: 'chopper-base'
                    }
                });
            });

            it('can defeat an upgrade that costs 2 or less on a friendly unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.ketsuOnyoOldFriend);
                context.player1.clickPrompt('Attack');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.bobaFettDaimyo, context.chopperBase]);
                context.player1.clickCard(context.chopperBase);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.heroicResolve, context.shield, context.academyTraining]);
                context.player1.clickCard(context.entrenched);
                expect(context.battlefieldMarine.isUpgraded()).toBe(false);
                expect(context.entrenched).toBeInZone('discard');
            });

            it('can defeat an upgrade that costs 2 or less on an enemy unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.ketsuOnyoOldFriend);
                context.player1.clickPrompt('Attack');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.bobaFettDaimyo, context.chopperBase]);
                context.player1.clickCard(context.chopperBase);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.heroicResolve, context.shield, context.academyTraining]);
                context.player1.clickCard(context.academyTraining);
                expect(context.imperialInterceptor.isUpgraded()).toBe(false);
                expect(context.academyTraining).toBeInZone('discard');
            });

            it('cannot defeat an upgrade after attacking a unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.ketsuOnyoOldFriend);
                context.player1.clickPrompt('Attack');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel, context.bobaFettDaimyo, context.chopperBase]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger ability from overwhelm damage', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.ketsuOnyoOldFriend);
                context.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                context.player1.clickCard(context.pykeSentinel);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.shield, context.academyTraining]);
                context.player1.clickCard(context.shield);
                expect(context.wampa.isUpgraded()).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('when used on a friendly upgrade attached to an enemy unit will cause the upgrade to be in friendly discard', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.guildTarget);
                context.player1.clickCard(context.mercenaryGunship);
                context.player2.passAction();
                context.player1.clickCard(context.ketsuOnyoOldFriend);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.chopperBase);
                expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.heroicResolve, context.shield, context.academyTraining, context.guildTarget]);
                context.player1.clickCard(context.guildTarget);
                expect(context.mercenaryGunship.isUpgraded()).toBe(false);
                expect(context.guildTarget).toBeInZone('discard', context.player1);
            });
        });
    });
});
