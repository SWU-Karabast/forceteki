import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class AlwaysTwo extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0463147975',
            internalName: 'always-two',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose 2 friendly unique Sith units. Give 2 Shield tokens and 2 Experience tokens to each chosen unit.',
            targetResolver: {
                mode: TargetMode.Exactly,
                numCards: 2,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.unique && card.hasSomeTrait(Trait.Sith),
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.giveShield({ amount: 2 }),
                    AbilityHelper.immediateEffects.giveExperience({ amount: 2 })
                ])
            },
            then: (selectedUnitsContext) => ({
                title: 'Defeat all other friendly units',
                immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({
                    target: context.player.getArenaUnits({
                        condition: (card) => !selectedUnitsContext.target?.includes(card)
                    })
                }))
            })
        });
    }
}