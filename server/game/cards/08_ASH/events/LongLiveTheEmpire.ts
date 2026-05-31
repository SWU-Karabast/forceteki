import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class LongLiveTheEmpire extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9020748123',
            internalName: 'long-live-the-empire'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat a friendly Imperial unit. If you do, resource the top card of your deck',
            targetResolver: {
                activePromptTitle: 'Defeat a friendly Imperial unit',
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Imperial),
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: {
                title: 'Resource the top card of your deck',
                immediateEffect: AbilityHelper.immediateEffects.resourceCard((context) => ({ target: context.player.getTopCardOfDeck() }))
            }
        });
    }
}