import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { IThenAbilityPropsWithSystems } from '../../../Interfaces';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';

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

    private attackWithUnitAbility(chosenCards: { card: IUnitCard; inPlayId: number }[], AbilityHelper: IAbilityHelper): Omit<IThenAbilityPropsWithSystems<TriggeredAbilityContext<NonLeaderUnitCard>>, 'title'> {
        return {
            optional: true,
            targetResolver: {
                activePromptTitle: 'Attack with a unit even if it is exhausted. It can\'t attack bases for this attack',
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) =>
                    card !== context.source &&
                    !chosenCards.some((chosen) => chosen.card === card && chosen.inPlayId === (card as IUnitCard).inPlayId),
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    targetCondition: (card) => !card.isBase(),
                    allowExhaustedAttacker: true,
                })
            },
            ifYouDo: (context) => {
                const target = context.target as IUnitCard;
                const targetInPlayId = target.isInPlay() ? target.inPlayId : target.mostRecentInPlayId;

                return {
                    title: 'Attack with a unit even if it is exhausted. It can\'t attack bases for this attack',
                    ...this.attackWithUnitAbility([...chosenCards, { card: target, inPlayId: targetInPlayId }], AbilityHelper),
                };
            },
        };
    }
}