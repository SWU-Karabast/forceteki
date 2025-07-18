import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class ForceChoke extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1446471743',
            internalName: 'force-choke',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: 'If you control a Force unit, this costs 1 resource less to play',
            amount: 1,
            condition: (context) => context.player.isTraitInPlay(Trait.Force)
        });

        registrar.setEventAbility({
            title: 'Deal 5 damage to a non-vehicle unit. That unit\'s controller draws a card.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.damage({ amount: 5 }),
                    AbilityHelper.immediateEffects.draw((context) => ({ target: context.target.controller }))
                ])
            }
        });
    }
}
