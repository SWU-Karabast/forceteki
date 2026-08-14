import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Bamboozle extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9644107128',
            internalName: 'bamboozle',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a unit and return each upgrade on it to its owner\'s hand',
            cannotTargetFirst: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.exhaust(),
                    AbilityHelper.immediateEffects.returnToHand((context) => ({
                        target: context.target.upgrades
                    }))
                ])
            }
        });

        registrar.addAlternatePlayCost({
            title: `Play Bamboozle by discarding a ${TextHelper.Cunning} card`,
            cost: AbilityHelper.costs.discardCardFromOwnHand({
                cardCondition: (card, context) => card !== context.source && card.hasSomeAspect(Aspect.Cunning)
            })
        });
    }
}
