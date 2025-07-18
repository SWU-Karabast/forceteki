import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class EnterprisingLackeys extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7204838421',
            internalName: 'enterprising-lackeys'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Defeat a friendly resource. If you do, put this unit into play as a resource.',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Resource,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: {
                title: 'Put this unit into play as a resource',
                immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.source })),
            }
        });
    }
}
