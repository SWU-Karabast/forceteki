import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { KeywordName, RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class VolleyFire extends EventCard {
    protected override getImplementationId () {
        return {
            id: '5636350836',
            internalName: 'volley-fire',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'A friendly unit deals damage equal to its Raid to an enemy unit',
            targetResolvers: {
                friendlyUnit: {
                    controller: RelativePlayer.Self,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit
                },
                damageTarget: {
                    activePromptTitle: (context) => {
                        const friendlyUnit = context.targets.friendlyUnit;
                        const raidAmount = friendlyUnit.getNumericKeywordTotal(KeywordName.Raid) ?? 0;

                        return `${friendlyUnit.title} deals ${raidAmount} damage to an enemy unit`;
                    },
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: context.targets.friendlyUnit.getNumericKeywordTotal(KeywordName.Raid) ?? 0,
                        source: context.targets.friendlyUnit
                    })),
                }
            }
        });
    }
}