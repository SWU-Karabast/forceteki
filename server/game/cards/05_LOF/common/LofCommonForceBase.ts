import AbilityHelper from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import { Trait } from '../../../core/Constants';

export abstract class LofCommonForceBase extends BaseCard {
    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'The Force is with you',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker.hasSomeTrait(Trait.Force) &&
                  event.attack.attacker.controller === context.player
            },
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
        });
    }
}