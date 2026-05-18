import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class CobbVanthLetMeHandleThis extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'cobb-vanth#let-me-handle-this-id',
            internalName: 'cobb-vanth#let-me-handle-this',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to this unit. If you do, give a Shield token to that unit',
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.player === context.player &&
                    event.card !== context.source
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                amount: 2,
                target: context.source
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give a Shield token to that unit',
                immediateEffect: abilityHelper.immediateEffects.giveShield({ target: ifYouDoContext.event.card })
            })
        });
    }
}