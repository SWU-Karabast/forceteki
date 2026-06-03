import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class SabineWrenILearnedTheHardWay extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6033198879',
            internalName: 'sabine-wren#i-learned-the-hard-way',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust a ground unit',
            collectiveTrigger: true,
            when: {
                onUpgradeAttached: (event, context) =>
                    event.parentCard === context.source
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            },
        });
    }
}