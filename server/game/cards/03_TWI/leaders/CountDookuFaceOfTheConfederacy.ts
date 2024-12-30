import AbilityHelper from '../../../AbilityHelper';
import { AbilityContext } from '../../../core/ability/AbilityContext';
import { PlayCardAction } from '../../../core/ability/PlayCardAction';
import { Card } from '../../../core/card/Card';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { PlayType, RelativePlayer, Trait, ZoneName } from '../../../core/Constants';
import * as Contract from '../../../core/utils/Contract';
import { IPlayCardProperties, PlayCardSystem } from '../../../gameSystems/PlayCardSystem';

export default class CountDookuFaceOfTheConfederacy extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5683908835',
            internalName: 'count-dooku#face-of-the-confederacy',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Play a Separatist card from your hand. It gains Exploit 1.',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => card.hasSomeTrait(Trait.Separatist),
                immediateEffect: new DookuPlayCardSystem<AbilityContext<this>>(1)
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        // this.addOnAttackAbility({
        //     title: 'If a friendly unit was defeated this phase, give a unit +2/+2 for this phase',
        //     optional: true,
        //     targetResolver: {
        //         cardTypeFilter: WildcardCardType.Unit,
        //         cardCondition: (card, context) => card !== context.source,
        //         immediateEffect: this.getWatTamborEffect(),
        //     }
        // });
    }
}

class DookuPlayCardSystem<TContext extends AbilityContext> extends PlayCardSystem<TContext> {
    private gainExploitAmount: number;

    public constructor(gainExploitAmount: number) {
        super({});

        this.gainExploitAmount = gainExploitAmount;
    }

    protected override clonePlayActionsWithOverrides(
        availableCardPlayActions: PlayCardAction[],
        card: Card,
        properties: IPlayCardProperties,
        context: TContext
    ) {
        Contract.assertTrue(card.isTokenOrPlayable() && !card.isToken(), `Card ${card.internalName} is not a non-token playable`);

        const [exploitActions, nonExploitActions] =
            availableCardPlayActions.reduce(
                (acc, val) => {
                    acc[val.usesExploit ? 0 : 1].push(val);
                    return acc;
                },
                [[], []]
            );

        Contract.assertTrue(exploitActions.length <= 1, `Found ${exploitActions.length} existing exploit actions for card ${card.internalName}`);

        // if there is not an existing exploit action, create one with exploit value 1
        // if there is one, add 1 to its exploit value
        let exploitAction: PlayCardAction;
        if (exploitActions.length === 0) {
            exploitAction = card.buildPlayCardAction({
                playType: PlayType.PlayFromHand,
                exploitValue: this.gainExploitAmount
            });
        } else {
            exploitAction = exploitActions[0].clone({
                playType: PlayType.PlayFromHand,
                exploitValue: exploitActions[0].exploitValue + this.gainExploitAmount
            });
        }

        return super.clonePlayActionsWithOverrides(nonExploitActions, card, properties, context)
            .concat(exploitAction);
    }
}

CountDookuFaceOfTheConfederacy.implemented = true;
