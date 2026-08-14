import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class NuvoVindiBlueShadowPerfected extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'nuvo-vindi#blue-shadow-perfected-id',
            internalName: 'nuvo-vindi#blue-shadow-perfected',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a Weakness token to a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.giveWeakness()
            }
        });

        registrar.addTriggeredAbility({
            title: 'Give a Weakness token to a unit',
            optional: true,
            limit: abilityHelper.limit.perRound(1),
            when: {
                onCardDefeated: (event, context) =>
                    EnumHelpers.isUnit(event.lastKnownInformation.type) &&
                    event.lastKnownInformation.controller !== context.player &&
                    event.lastKnownInformation.upgrades?.some((upgrade) => upgrade.isWeakness())
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.giveWeakness()
            }
        });
    }
}
