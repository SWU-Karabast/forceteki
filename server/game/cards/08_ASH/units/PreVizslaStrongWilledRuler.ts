import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';
import { EventName, TargetMode, WildcardCardType } from '../../../core/Constants';
import { EventResolutionStatus } from '../../../core/event/GameEvent';

export default class PreVizslaStrongWilledRuler extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'pre-vizsla#strongwilled-ruler-id',
            internalName: 'pre-vizsla#strongwilled-ruler'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat any number of non-leader units with a total of 6 or less remaining HP. Create a Mandalorian token for each unit defeated this way',
            targetResolver: {
                activePromptTitle: 'Choose any number of non-leader units with a total of 6 or less remaining HP',
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                multiSelectCardCondition: (card, selectedCards) => card.isUnit() && selectedCards.reduce((totalHp, selectedCard) => totalHp + (selectedCard as IUnitCard).remainingHp, card.remainingHp) <= 6,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => {
                const defeatResolved = ifYouDoContext.events.filter((e) => e.name === EventName.OnCardDefeated && e.resolutionStatus === EventResolutionStatus.RESOLVED).length;
                return ({
                    title: 'For each unit defeated this way, create a Mandalorian token',
                    immediateEffect: AbilityHelper.immediateEffects.createMandalorian({ amount: defeatResolved }),
                });
            }
        });
    }
}