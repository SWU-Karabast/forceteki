import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { IThenAbilityPropsWithSystems } from '../../../Interfaces';

export default class MonMothmaClingingToHope extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1347170274',
            internalName: 'mon-mothma#clinging-to-hope',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Attack with any number of other units, even if those units are exhausted. They can\'t attack bases for these attacks',
            ...this.attackWithUnitAbility([], AbilityHelper),
        });
    }

    private attackWithUnitAbility(chosenCards: Card[], AbilityHelper: IAbilityHelper): Omit<IThenAbilityPropsWithSystems<TriggeredAbilityContext<NonLeaderUnitCard>>, 'title'> {
        return {
            optional: true,
            targetResolver: {
                activePromptTitle: 'Attack with a unit even if it is exhausted. It can\'t attack bases for this attack',
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source && !chosenCards.includes(card),
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    targetCondition: (card) => !card.isBase(),
                    allowExhaustedAttacker: true,
                })
            },
            then: (context) => ({
                title: 'Attack with a unit even if it is exhausted. It can\'t attack bases for this attack',
                ...this.attackWithUnitAbility([...chosenCards, context.target], AbilityHelper),
            }),
        };
    }
}