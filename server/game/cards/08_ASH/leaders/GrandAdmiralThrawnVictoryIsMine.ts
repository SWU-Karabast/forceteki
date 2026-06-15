import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { Helpers } from '../../../core/utils/Helpers';

export default class GrandAdmiralThrawnVictoryIsMine extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1997690465',
            internalName: 'grand-admiral-thrawn#victory-is-mine',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a unit. It gains Restore 2 for this attack if you control the same number of units as the defending player.',
            contextTitle: (context) => this.actionTitle(context),
            cost: AbilityHelper.costs.exhaustSelf(),
            initiateAttack: {
                attackerLastingEffects: {
                    condition: (_, context) => context.player.getArenaUnits().length === context.player.opponent.getArenaUnits().length,
                    effect: AbilityHelper.ongoingEffects.gainKeyword({
                        keyword: KeywordName.Restore,
                        amount: 2
                    })
                }

            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Defeat a non-leader unit the defending player controls',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.getArenaUnits().length > context.player.opponent.getArenaUnits().length,
                    onTrue: AbilityHelper.immediateEffects.defeat()
                })
            }
        });
    }

    private actionTitle(context: AbilityContext): string {
        const opponentUnits = context.player.opponent.getArenaUnits().length;
        return opponentUnits === 0
            ? 'Attack with a unit.'
            : `Attack with a unit. It gains Restore 2 for this attack if you control ${Helpers.pluralize(opponentUnits, '1 unit', 'units')}.`;
    }
}
