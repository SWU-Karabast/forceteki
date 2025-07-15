import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, KeywordName, Trait } from '../../../core/Constants';

export default class ObiwanKenobiProtectivePadawan extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6059510270',
            internalName: 'obiwan-kenobi#protective-padawan'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'This unit gains Sentinel for this phase',
            when: {
                onCardPlayed: (event, context) => event.cardTypeWhenInPlay === CardType.BasicUnit &&
                  event.card.hasSomeTrait(Trait.Force) &&
                  event.player === context.player,
            },
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
            }),
        });
    }
}