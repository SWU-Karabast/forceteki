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
            title: 'Defeat a unit with cost equal to or less than the number of Villainy aspect icons among friendly units',
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