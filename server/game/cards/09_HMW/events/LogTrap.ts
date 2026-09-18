import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class LogTrap extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4239493544',
            internalName: 'log-trap',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.attack()
            },
            then: (thenContext) => ({
                title: 'Attack with it again. It can\'t attack bases for this attack',
                initiateAttack: {
                    attackerCondition: (card) => thenContext.target === card,
                    targetCondition: (target) => target.isUnit(),
                    allowExhaustedAttacker: true
                }
            }),
        });
    }
}