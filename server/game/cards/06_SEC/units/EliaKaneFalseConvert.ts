import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class EliaKaneFalseConvert extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'elia-kane#false-convert-id',
            internalName: 'elia-kane#false-convert'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addWhenPlayedAbility({
            title: 'Look at 3 enemy resources',
            immediateEffect: AbilityHelper.immediateEffects.randomSelection((context) => ({
                target: context.player.opponent.resources,
                count: 3,
                innerSystem: AbilityHelper.immediateEffects.lookAtAndSelectCard((lookAtContext) => ({
                    activePromptTitle: 'Select an enemy resource to defeat. If you do, its controller puts the top card of their deck into play as a resource and readies it.',
                    displayTextByCardUuid: new Map(
                        Helpers.asArray(lookAtContext.targets.randomTarget)
                            .map((card) => [card.uuid, card.exhausted ? 'Exhausted' : 'Ready'])
                    ),
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.defeat(),
                        AbilityHelper.immediateEffects.resourceCard({
                            targetPlayer: RelativePlayer.Opponent,
                            target: context.player.opponent.getTopCardOfDeck(),
                            readyResource: true
                        })
                    ])
                }))
            }))
        });
    }
}