import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Breach extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'breach-id',
            internalName: 'breach',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `A friendly unit deals damage equal to its power to an enemy unit in its arena. If the friendly unit has ${TextHelper.Overwhelm}, deal excess damage to an enemy base.`,
            contextTitle: (context) => {
                if (context.targets.friendlyUnit) {
                    const overwhelm = context.targets.friendlyUnit.hasSomeKeyword(KeywordName.Overwhelm) ? ' Deal excess damage to an enemy base' : '';
                    return `${context.targets.friendlyUnit.title} deals ${context.targets.friendlyUnit.getPower()} damage to an enemy unit in its arena.${overwhelm}`;
                }
                return `A friendly unit deals damage equal to its power to an enemy unit in its arena. If the friendly unit has ${TextHelper.Overwhelm}, deal excess damage to an enemy base`;
            },
            targetResolvers: {
                friendlyUnit: {
                    controller: RelativePlayer.Self,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit
                },
                enemyUnit: {
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => card.zoneName === context.targets.friendlyUnit.zoneName,
                    immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                        amount: context.targets.friendlyUnit.getPower(),
                        target: context.targets.enemyUnit,
                        source: context.targets.friendlyUnit
                    })),
                },
            },
            ifYouDo: (ifYouDoContext) => ({
                // TODO TWIN SUNS
                title: `Deal ${ifYouDoContext.resolvedEvents[0]?.availableExcessDamage ?? 0} damage to an enemy base`,
                ifYouDoCondition: () =>
                    ifYouDoContext.targets.friendlyUnit.hasSomeKeyword(KeywordName.Overwhelm) &&
                    (ifYouDoContext.resolvedEvents[0]?.availableExcessDamage ?? 0) > 0,
                immediateEffect: abilityHelper.immediateEffects.damage({
                    target: ifYouDoContext.player.opponent.base,
                    amount: ifYouDoContext.resolvedEvents[0].availableExcessDamage,
                    source: ifYouDoContext.targets.friendlyUnit,
                })
            })
        });
    }
}