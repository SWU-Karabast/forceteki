import { BaseCard } from '../../../core/card/BaseCard';
import AbilityHelper from '../../../AbilityHelper';
import { KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class EnergyConversionLab extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '8327910265',
            internalName: 'energy-conversion-lab',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar) {
        registrar.setEpicActionAbility({
            title: 'Play a unit that costs 6 or less from your hand. Give it ambush for this phase',
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 6,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous({
                    gameSystems: [
                        AbilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit }),
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect({ effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush) }),
                    ],
                    resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                })
            }
        });
    }
}
