import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class CadBaneHostageTaker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0693815329',
            internalName: 'cad-bane#hostage-taker'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'This unit captures up to 3 enemy non-leader units with a total of 8 or less remaining HP',
            targetResolver: {
                activePromptTitle: 'Choose up to 3 enemy non-leader units with a total of 8 or less remaining HP',
                mode: TargetMode.UpTo,
                canChooseNoCards: true,
                numCards: 3,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                multiSelectCardCondition: (card, selectedCards) => card.isUnit() && selectedCards.reduce((totalHp, selectedCard) => totalHp + (selectedCard as IUnitCard).remainingHp, card.remainingHp) <= 8,
                immediateEffect: AbilityHelper.immediateEffects.capture()
            }
        });

        registrar.addOnAttackAbility({
            title: 'Rescue a card you own captured by Cad Bane and the opponent draws 2 cards',
            optional: true,
            playerChoosingOptional: RelativePlayer.Opponent,
            targetResolver: {
                choosingPlayer: RelativePlayer.Opponent,
                zoneFilter: ZoneName.Capture,
                capturedByFilter: (context) => context.source,
                cardCondition: (card, context) => card.owner === context.player.opponent,
                immediateEffect: AbilityHelper.immediateEffects.rescue()
            },
            ifYouDo: {
                title: 'Draw 2 cards',
                immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 2 })
            }
        });
    }
}
