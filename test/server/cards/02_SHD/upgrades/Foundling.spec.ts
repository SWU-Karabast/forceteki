import { Trait } from '../../../../../server/game/core/Constants';

describe('Foundling\'s', function () {
    integration(function (contextRef) {
        describe('Foundling', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['foundling', 'mandalorian-warrior'],
                        groundArena: ['battlefield-marine', 'pyke-sentinel', 'protector-of-the-throne'],
                    },
                    player2: {
                        groundArena: ['snowspeeder']
                    }
                });
            });

            it('ability should give the attached card the Mandalorian trait', function () {
                const { context } = contextRef;

                // check battlefield marine trait
                expect(context.battlefieldMarine.hasSomeTrait(Trait.Mandalorian)).toBeFalse();

                // add battlefield marine foundling
                context.player1.clickCard(context.foundling);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.snowspeeder, context.pykeSentinel, context.protectorOfTheThrone]);
                context.player1.clickCard(context.battlefieldMarine);

                // check players units traits
                expect(context.battlefieldMarine.hasSomeTrait(Trait.Mandalorian)).toBeTrue();
                expect(context.pykeSentinel.hasSomeTrait(Trait.Mandalorian)).toBeFalse();

                context.player2.passAction();
                // mandalorian warrior should be able to add experience to battlefield marine
                context.player1.clickCard(context.mandalorianWarrior);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.protectorOfTheThrone]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'foundling']);
            });
        });
    });
});
