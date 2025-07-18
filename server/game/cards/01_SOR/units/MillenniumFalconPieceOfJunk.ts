import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, TargetMode, WildcardZoneName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class MillenniumFalconPieceOfJunk extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1785627279',
            internalName: 'millennium-falcon#piece-of-junk'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit enters play ready',
            sourceZoneFilter: WildcardZoneName.Any,
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.EntersPlayReady)
        });

        registrar.addTriggeredAbility({
            title: 'Either pay 1 resource or return this unit to her owner\'s hand',
            when: {
                onRegroupPhaseReadyCards: (event) => event.resolutionStatus === 'created'
            },
            targetResolver: {
                mode: TargetMode.Select,
                choices: (context) => ({
                    ['Pay 1 resource']: AbilityHelper.immediateEffects.payResourceCost({
                        target: context.player,
                        amount: 1
                    }),
                    ['Return this unit to her owner\'s hand']: AbilityHelper.immediateEffects.returnToHand({
                        target: context.source
                    })
                })
            }
        });
    }
}
