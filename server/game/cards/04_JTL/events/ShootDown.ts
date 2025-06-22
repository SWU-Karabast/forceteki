import { EventCard } from '../../../core/card/EventCard';
import { CardType, WildcardCardType, ZoneName } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class ShootDown extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7730475388',
            internalName: 'shoot-down',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 3 damage to space unit. If that unit is defeated this way, deal 2 damage to a base',
            targetResolver: {
                zoneFilter: ZoneName.SpaceArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            },
            ifYouDo: {
                title: 'Deal 2 damage to a base',
                optional: true,
                ifYouDoCondition: (ifYouDoContext) => ifYouDoContext.resolvedEvents[0].willDefeat,
                immediateEffect: AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Deal 2 damage to a base',
                    cardTypeFilter: CardType.Base,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                })
            }
        });
    }
}
