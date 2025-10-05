import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, WildcardCardType } from '../../../core/Constants';

export default class EvilIsEverywhere extends EventCard {
    protected override getImplementationId () {
        return {
            id: '9136668882',
            internalName: 'evil-is-everywhere',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. For this attack, it gets +1/+0 for each card in your hand',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => {
                    const villainyAspectCount = context.player.getArenaUnits({})
                        .map((x) => x.aspects)
                        .flat()
                        .filter((x) => x === Aspect.Villainy).length;

                    return card.isUnit() && card.cost === villainyAspectCount;
                },
                immediateEffect: abilityHelper.immediateEffects.defeat()
            }
        });
    }
}