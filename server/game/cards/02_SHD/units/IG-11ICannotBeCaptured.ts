import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';

export default class IG11ICannotBeCaptured extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3417125055',
            internalName: 'ig11#i-cannot-be-captured',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addReplacementEffectAbility({
            title: 'If this unit would be captured, defeat him and deal 3 damage to each enemy ground unit instead',
            when: {
                onCardCaptured: (event, context) => event.card === context.source
            },
            replaceWith: {
                target: this,
                replacementImmediateEffect: AbilityHelper.immediateEffects.simultaneous({
                    gameSystems: [
                        AbilityHelper.immediateEffects.defeat(),
                        AbilityHelper.immediateEffects.damage((context) => {
                            return {
                                amount: 3,
                                target: context.game.getOtherPlayer(context.player).getArenaUnits({ arena: ZoneName.GroundArena })
                            };
                        })
                    ],
                    resolutionMode: ResolutionMode.AlwaysResolve,
                })
            },
            effect: 'defeat him and deal 3 damage to each enemy ground unit instead',
            effectArgs: (context) => [context.source],
        });

        registrar.addOnAttackAbility({
            title: 'Deal 3 damage to a damaged ground unit',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.damage >= 1 && card.zoneName === ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            }
        });
    }
}
