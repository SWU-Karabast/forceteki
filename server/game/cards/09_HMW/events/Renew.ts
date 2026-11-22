import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Renew extends EventCard {
    protected override getImplementationId () {
        return {
            id: '4263606084',
            internalName: 'renew',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Defeat a ${TextHelper.Trait.Condition} upgrade. Heal 3 damage from your base`,
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    optional: true,
                    cardTypeFilter: WildcardCardType.Upgrade,
                    cardCondition: (card) => card.isUpgrade() && card.hasSomeTrait(Trait.Condition),
                    immediateEffect: AbilityHelper.immediateEffects.defeat(),
                }),
                AbilityHelper.immediateEffects.heal((context) => ({ amount: 3, target: context.player.base }))
            ])
        });
    }
}