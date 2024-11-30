import { Trait } from '../../../../../server/game/core/Constants';

describe('Mandalorian Armor\'s', function () {
    integration(function (contextRef) {
        describe('Mandalorian Armor', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mandalorian-armor'],
                        groundArena: ['battlefield-marine', 'mandalorian-warrior', 'snowspeeder'],
                    }
                });
            });

            it('should give shield to mandalorian unit', function () {
                const { context } = contextRef;

                expect(context.mandalorianWarrior.hasSomeTrait(Trait.Mandalorian)).toBeTrue();

                context.player1.clickCard(context.mandalorianArmor);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.mandalorianWarrior]);
                context.player1.clickCard(context.mandalorianWarrior);

                expect(context.mandalorianWarrior).toHaveExactUpgradeNames(['mandalorian-armor', 'shield']);
            });

            it('should not give shield to non-mandalorian unit', function () {
                const { context } = contextRef;

                expect(context.battlefieldMarine.hasSomeTrait(Trait.Mandalorian)).toBeFalse();

                context.player1.clickCard(context.mandalorianArmor);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.mandalorianWarrior]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['mandalorian-armor']);
            });
        });
    });
});
