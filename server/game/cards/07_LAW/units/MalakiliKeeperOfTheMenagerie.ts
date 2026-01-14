import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class MalakiliKeeperOfTheMenagerie extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2947761350',
            internalName: 'malakili#keeper-of-the-menagerie',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly creature unit and each creature unit you own that isn\'t in play gains the Underworld trait',
            targetZoneFilter: WildcardZoneName.Any,
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            matchTarget: (card, context) =>
                card.owner === context.player &&
                card.hasSomeTrait(Trait.Creature),
            ongoingEffect: AbilityHelper.ongoingEffects.gainTrait(Trait.Underworld),
        });
    }
}