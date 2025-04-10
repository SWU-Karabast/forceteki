import AbilityHelper from '../../AbilityHelper';
import { BaseCard } from './BaseCard';
import { Trait } from '../Constants';

export class LOFCommonBase extends BaseCard {
    protected override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'The Force is with you',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker.hasSomeTrait(Trait.Force) &&
                  event.attack.attacker.controller === context.player
            },
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
        });
    }
}