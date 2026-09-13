import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class KrrsantanSanto extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'krrsantan#santo-id',
            internalName: 'krrsantan#santo',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal damage equal to the number of resources you control minus 3 to a ground unit',
            optional: true,
            targetResolver: {
                activePromptTitle: (context) => `Deal ${Math.max(0, context.player.resources.length - 3)} damage to a ground unit`,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({ amount: Math.max(0, context.player.resources.length - 3) }))
            }
        });
    }
}