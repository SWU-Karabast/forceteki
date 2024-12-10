import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RicketyQuadjumper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7291903225',
            internalName: 'rickety-quadjumper'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Reveal a card',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({ target: context.source.controller.getTopCardOfDeck() })),

            ifYouDo: (context) => ({
                title: 'Deal 2 damage to a ground unit',
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: !context.events[0].card.isUnit(),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        innerSystem: AbilityHelper.immediateEffects.giveExperience(),
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            })
        });
    }
}

RicketyQuadjumper.implemented = true;