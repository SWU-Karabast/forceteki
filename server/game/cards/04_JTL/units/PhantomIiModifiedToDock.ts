import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, KeywordName, WildcardRelativePlayer } from '../../../core/Constants';
import type { Player } from '../../../core/Player';

export default class PhantomIiModifiedToDock extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5306772000',
            internalName: 'phantom-ii#modified-to-dock',
        };
    }

    public override getUpgradeHp() {
        return 0;
    }

    public override getUpgradePower() {
        return 0;
    }

    public override canAttach(targetCard: Card, _context: AbilityContext<this>, _controller: Player) {
        return targetCard.isUnit() && targetCard.title === 'The Ghost';
    }

    public override checkIsAttachable(): void {
        return;
    }

    public override setupCardAbilities () {
        this.addActionAbility({
            title: 'Attach this as an upgrade to The Ghost',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1)],
            condition: () => this.isUnit(),
            targetResolver: {
                cardCondition: (card) => card.title === 'The Ghost',
                immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                    upgrade: context.source
                }))
            }
        });

        // TODO: rework things a bit so we don't have to declare this as a piloting ability when it technically isn't
        this.addPilotingAbility({
            title: 'Attached unit gets +3/+3 and gains Grit',
            type: AbilityType.Constant,
            condition: () => this.isAttached(),
            matchTarget: (card, context) => card === context.source.parentCard,
            targetController: WildcardRelativePlayer.Any,
            ongoingEffect: [
                AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 3 }),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit)
            ]
        });
    }
}