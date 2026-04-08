import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';
import { BaseCard } from '../../../core/card/BaseCard';

export default class FirstBattleMemorial extends BaseCard {
    protected override getImplementationId() {
        return {
            id: 'first-battle-memorial-id',
            internalName: 'first-battle-memorial',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEpicActionAbility({
            title: 'For each friendly leader unit, give an Experience token to a unit',
            immediateEffect: abilityHelper.immediateEffects.simultaneous((context) => (
                context.player.getArenaUnits({ condition: (c) => c.isLeaderUnit() }).map((_) =>
                    abilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: abilityHelper.immediateEffects.giveExperience()
                    }))
            ))
        });
    }
}
