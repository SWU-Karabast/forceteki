import { EventCard } from '../../../core/card/EventCard';
import { CardType, WildcardCardType, ZoneName } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import { forEach } from 'underscore';

export default class ShootDown extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7730475388',
            internalName: 'shoot-down',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 3 damage to space unit.',
            targetResolver: {
                zoneFilter: ZoneName.SpaceArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    amount: 3
                })
            },
            then: (thenContext) => ({
                title: 'Deal 2 damage to a base',
                optional: true,
                thenCondition: () => thenContext.events.length > 0,
                immediateEffect: this.shouldDealDamageToABase(thenContext)
            })
        });
    }

    private shouldDealDamageToABase(thenContext: AbilityContext<Card>) {
        let shouldDealDamageToBase = false;
        forEach(thenContext.events, (e) => {
            if (e.willDefeat) {
                shouldDealDamageToBase = true;
            }
        });

        if (shouldDealDamageToBase) {
            return AbilityHelper.immediateEffects.selectCard({
                cardTypeFilter: CardType.Base,
                innerSystem: AbilityHelper.immediateEffects.damage({ amount: 2 }),
            });
        }
        return AbilityHelper.immediateEffects.noAction();
    }
}
