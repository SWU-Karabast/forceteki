import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class TaramynBarconaEyesFront extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'taramyn-barcona#eyes-front-id',
            internalName: 'taramyn-barcona#eyes-front',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat a Credit token. If you do, give an Experience token to this unit and another friendly unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Token,
                cardCondition: (card) => card.isCreditToken(),
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: {
                title: 'Give an Experience token to this unit and a friendly unit',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.giveExperience(),
                    AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card, context) => card !== context.source,
                        controller: RelativePlayer.Self,
                        immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
                    })
                ]),
            }
        });
    }
}