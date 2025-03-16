import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, Trait, WildcardRelativePlayer } from '../../../core/Constants';

export default class PantoranStarshipThief extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6515230001',
            internalName: 'pantoran-starship-thief',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Pay 3 resources',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.payResourceCost((context) => ({
                amount: 3,
                target: context.player
            })),
            ifYouDo: {
                title: `Attach ${this.title} as an upgrade to a Fighter or Transport unit without a Pilot on it. Take control of that unit`,
                targetResolver: {
                    controller: WildcardRelativePlayer.Any,
                    cardCondition: (card) => card.isUnit() &&
                      (card.hasSomeTrait(Trait.Fighter) || card.hasSomeTrait(Trait.Transport)) &&
                      !card.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot)),
                    immediateEffect: AbilityHelper.immediateEffects.sequential([
                        AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                            upgrade: context.source,
                        })),
                        AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                            newController: context.source.owner,
                        })),
                    ]),
                }
            }
        });

        this.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'That unit’s owner takes control of it',
            when: {
                onUpgradeUnattached: (event, context) => event.upgradeCard === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                target: context.event.parentCard,
                newController: context.event.parentCard.owner
            }))
        });
    }
}