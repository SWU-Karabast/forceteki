import AbilityHelper from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import { Trait } from '../../../core/Constants';

export default class ShadowedUndercity extends BaseCard {
    protected override getImplementationId() {
        return {
            id: 'temp-shadowed-undercity-id',
            internalName: 'shadowed-undercity',
        };
    }

    protected override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'The Force is with you',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker.hasSomeTrait(Trait.Force) &&
                  event.attack.attacker.controller === context.source.owner
            },
            immediateEffect: AbilityHelper.immediateEffects.createForceToken()
        });
    }
}