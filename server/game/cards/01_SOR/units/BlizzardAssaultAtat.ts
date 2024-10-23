import AbilityHelper from '../../../AbilityHelper';
import { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Location, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import * as Contract from '../../../core/utils/Contract';


export default class BlizzardAssaultAtat extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3830969722',
            internalName: 'blizzard-assault-atat',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Deal the excess damage from this attack to an enemy ground unit',
            optional: true,
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttackerDamage &&
                    event.defeatSource.attack.attacker === context.source
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                locationFilter: Location.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: this.getAvailableExcessDamage(context),
                }))
            }
        });
    }

    private getAvailableExcessDamage(context: TriggeredAbilityContext<this>): number {
        const combatDamageEvent = context.event.defeatSource?.event;

        Contract.assertNotNullLike(combatDamageEvent, 'Unable to locate combat damage event from card defeat event');

        if (combatDamageEvent.availableExcessDamage === 0) {
            return 0;
        }

        // excess damage can be "used up" by effects such as this or Overwhelm, making it unavailable for other effects
        // see unofficial dev ruling at https://nexus.cascadegames.com/resources/Rules_Clarifications/
        const excessDamage = combatDamageEvent.availableExcessDamage;
        combatDamageEvent.availableExcessDamage = 0;

        return excessDamage;
    }
}

BlizzardAssaultAtat.implemented = true;
