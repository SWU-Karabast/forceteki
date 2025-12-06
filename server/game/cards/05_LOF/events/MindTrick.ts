import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode, Trait, WildcardCardType } from '../../../core/Constants';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';

export default class MindTrick extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1146162009',
            internalName: 'mind-trick',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust any number of units with a combined power of 4 or less. If you control a Force unit, those units lose all abilities and can\'t gain abilities for this phase',
            targetResolver: {
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                cardTypeFilter: WildcardCardType.Unit,
                multiSelectCardCondition: (card, selectedCards) => card.isUnit() && selectedCards.reduce((totalPower, selectedCard) => totalPower + (selectedCard as IUnitCard).getPower(), card.getPower()) <= 4,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.exhaust(),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.player.hasSomeArenaUnit({ trait: Trait.Force }),
                        onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.loseAllAbilities(),
                            ongoingEffectDescription: 'remove all abilities from'
                        })
                    })
                ])
            }
        });
    }
}