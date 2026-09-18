import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class EmerieKarrForYourOwnGood extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6241727747',
            internalName: 'emerie-karr#for-your-own-good',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Deal 1 damage to another ground unit. If you control that unit, the next unit you play this phase costs ${TextHelper.resource(1)} less`,
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: `The next unit you play this phase costs ${TextHelper.resource(1)}`,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: ifYouDoContext?.target.controller === ifYouDoContext.source.controller,
                    onTrue: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                        ongoingEffectDescription: 'discount the next unit played by',
                        ongoingEffectTargetDescription: 'them',
                        effect: AbilityHelper.ongoingEffects.decreaseCost({
                            cardTypeFilter: WildcardCardType.Unit,
                            limit: AbilityHelper.limit.perPlayerPerGame(1),
                            amount: 1
                        })
                    }),
                })
            })
        });
    }
}