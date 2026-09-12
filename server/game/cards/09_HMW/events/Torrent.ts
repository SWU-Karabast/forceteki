import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Torrent extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'torrent-id',
            internalName: 'torrent',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Give a Weakness token to a unit. If you control a ${TextHelper.Trait.Naboo} base, give 2 Weakness tokens to that unit instead.`,
            contextTitle: (context) => `Give ${context.player.base.hasSomeTrait(Trait.Naboo) ? '2 Weakness tokens' : 'a Weakness token'} to ${context.target ? context.target.title : 'a unit'}`,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.giveWeakness((context) => ({
                    amount: context.player.base.hasSomeTrait(Trait.Naboo) ? 2 : 1
                }))
            }
        });
    }
}