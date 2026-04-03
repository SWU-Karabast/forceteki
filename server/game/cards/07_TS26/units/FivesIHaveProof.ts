import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, StandardTriggeredAbilityType, WildcardCardType } from '../../../core/Constants';

export default class FivesIHaveProof extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9883276208',
            internalName: 'fives#i-have-proof',
        };
    }

    public override getAbilityRegistrar(): INonLeaderUnitAbilityRegistrar {
        return super.getAbilityRegistrar();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPreEnterPlayAbility({
            title: 'This unit enters play with the "When Played" abilities of another unit in play',
            optional: true,
            targetResolver: {
                activePromptTitle: 'Choose a unit to copy "When Played" abilities from',
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) =>
                    card !== context.source &&
                    card.canRegisterTriggeredAbilities() &&
                    card.getTriggeredAbilities().some((ability) => ability.isWhenPlayed),
                immediateEffect: AbilityHelper.immediateEffects.cardLastingEffect((context) => ({
                    duration: Duration.Custom,
                    until: {
                        onCardLeavesPlay: (event, context) => event.card === context.source,
                    },
                    target: context.source,
                    effect: [
                        AbilityHelper.ongoingEffects.copyStandardTriggeredAbilities(context.target, StandardTriggeredAbilityType.WhenPlayed),
                    ]
                })),
            },
        });
    }
}
