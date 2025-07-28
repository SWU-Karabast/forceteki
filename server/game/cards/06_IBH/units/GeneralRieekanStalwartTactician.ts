import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Aspect } from '../../../core/Constants';

export default class GeneralRieekanStalwartTactician extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8709200009',
            internalName: 'general-rieekan#stalwart-tactician',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with another Heroism unit. It gets +2/+0 for this attack',
            cost: abilityHelper.costs.exhaustSelf(),
            initiateAttack: {
                attackerCondition: (card, context) => card.hasSomeAspect(Aspect.Heroism) && card !== context.source,
                attackerLastingEffects: {
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                }
            }
        });
    }
}