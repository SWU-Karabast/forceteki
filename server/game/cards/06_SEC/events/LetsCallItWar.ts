import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventName, WildcardCardType } from '../../../core/Constants';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';

export default class LetsCallItWar extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8330828981',
            internalName: 'lets-call-it-war',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 3 damage to a unit. If you have the initiative, you may deal 2 damage to another unit in the same arena.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            },
            then: (thenContext) => ({
                title: 'Deal 2 damage to another unit in the same arena',
                thenCondition: () => thenContext.player.hasInitiative(),
                optional: true,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, _) => card !== thenContext.target && this.isUnitInSameArena(card, thenContext),
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }
            })
        });
    }

    private isUnitInSameArena(card: Card, context: AbilityContext): boolean {
        const damageEvent = context.events.filter((event) => event.name === EventName.OnDamageDealt)[0];
        if (damageEvent.lastKnownInformation) {
            return damageEvent.lastKnownInformation.arena === card.zoneName;
        }
        return damageEvent.card.zoneName === card.zoneName;
    }
}