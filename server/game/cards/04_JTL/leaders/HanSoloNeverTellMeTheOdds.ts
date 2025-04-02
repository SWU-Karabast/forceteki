import AbilityHelper from '../../../AbilityHelper';
import type { Attack } from '../../../core/attack/Attack';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, DeployType, WildcardZoneName } from '../../../core/Constants';

export default class HanSoloNeverTellMeTheOdds extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0616724418',
            internalName: 'han-solo#never-tell-me-the-odds',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addPilotDeploy();

        this.addActionAbility({
            title: 'Reveal the top card of your deck',
            immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({
                target: context.player.getTopCardOfDeck(),
                useDisplayPrompt: true
            })),
            cost: AbilityHelper.costs.exhaustSelf(),
            then: (thenContext) => ({
                title: 'Attack with a unit',
                initiateAttack: {
                    attackerLastingEffects: {
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                        condition: (attack: Attack) => {
                            // This means that the deck was empty or no card could be revealed
                            if (thenContext.events.length === 0) {
                                return false;
                            }
                            const attackerCost = attack.attacker.cost;
                            const revealedCardCost = thenContext.events[0].card[0].cost;
                            return this.isOdd(attackerCost) && this.isOdd(revealedCardCost) && attackerCost !== revealedCardCost;
                        }
                    }
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addPilotingAbility({
            title: 'For each friendly unit or upgrade that has an odd cost, ready a resource.',
            type: AbilityType.Triggered,
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source && event.type === DeployType.LeaderUpgrade
            },
            zoneFilter: WildcardZoneName.AnyArena,
            immediateEffect: AbilityHelper.immediateEffects.readyResources((context) => {
                const friendlyUnits = context.player.getArenaUnits().filter((unit) => unit.isUnit() && this.isOdd(unit.cost)).length;
                const friendlyUpgrades = context.player.getArenaUpgrades().filter((upgrade) => this.isOdd(upgrade.cost)).length;
                return {
                    amount: friendlyUnits + friendlyUpgrades
                };
            })
        });
    }

    private isOdd(num: number): boolean {
        return num % 2 === 1;
    }
}