import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TextHelper } from '../../../core/utils/TextHelper';
import { RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class Overgrowth extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'overgrowth-id',
            internalName: 'overgrowth',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `If you control a ${TextHelper.Trait.Kashyyyk} base, a friendly unit deals damage equal to its power to an enemy unit. Resource this card`,
            immediateEffect: abilityHelper.immediateEffects.sequential([
                abilityHelper.immediateEffects.conditional({
                    condition: (c) => c.player.base.hasSomeTrait(Trait.Kashyyyk),
                    onTrue: abilityHelper.immediateEffects.selectCard({
                        controller: RelativePlayer.Self,
                        cardTypeFilter: WildcardCardType.Unit,
                        zoneFilter: WildcardZoneName.AnyArena,
                        name: 'friendlyUnit',
                        immediateEffect: abilityHelper.immediateEffects.selectCard({
                            controller: RelativePlayer.Opponent,
                            cardTypeFilter: WildcardCardType.Unit,
                            zoneFilter: WildcardZoneName.AnyArena,
                            name: 'enemyUnit',
                            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                                amount: context.targets.friendlyUnit?.getPower(),
                                target: context.targets.enemyUnit
                            }))
                        })
                    }),
                }),
                abilityHelper.immediateEffects.resourceCard((context) => ({ target: context.source })),
            ])
        });
    }
}