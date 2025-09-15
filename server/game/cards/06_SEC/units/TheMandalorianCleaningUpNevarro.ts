import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';
import { DefeatCardSystem } from '../../../gameSystems/DefeatCardSystem';

export default class TheMandalorianCleaningUpNevarro extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-mandalorian#cleaning-up-nevarro-id',
            internalName: 'the-mandalorian#cleaning-up-nevarro',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Capture an enemy non-leader unit',
            optional: true,
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttacker && DefeatCardSystem.defeatSourceCard(event) === context.source
            },
            targetResolver: {
                activePromptTitle: 'Choose a non-Leader unit',
                mode: TargetMode.Exactly,
                canChooseNoCards: true,
                numCards: 1,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.capture()
            }
        });
    }
}