import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, WildcardCardType } from '../../../core/Constants';

export default class GeneralGrievousFourArmedMenace extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'general-grievous#fourarmed-menace-id',
            internalName: 'general-grievous#fourarmed-menace',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Choose an effect that hasn\'t been chosen this phase',
            when: {
                onCardPlayed: (event, context) =>
                    event.player === context.player &&
                    (event.cardTypeWhenInPlay === CardType.BasicUpgrade || event.playAsType === WildcardCardType.Upgrade) &&
                    event.attachTarget === context.source,
            },
            immediateEffect: abilityHelper.immediateEffects.chooseModalEffects((context) => ({
                amountOfChoices: 1,
                choices: {
                    [`Give an Experience token to ${context.source.title}`]: abilityHelper.immediateEffects.giveExperience(),
                    ['Heal 3 damage from your base']: abilityHelper.immediateEffects.heal({
                        target: context.player.base,
                        amount: 3
                    }),
                    ['Draw a card']: abilityHelper.immediateEffects.draw()
                }
            }))
        });
    }
}