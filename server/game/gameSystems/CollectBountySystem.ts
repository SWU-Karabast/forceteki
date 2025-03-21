import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { ITriggeredAbilityBaseProps } from '../Interfaces';
import { BountyAbility } from '../abilities/keyword/BountyAbility';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import * as Contract from '../core/utils/Contract';
import * as Helpers from '../core/utils/Helpers';

export interface ICollectBountyProperties extends ICardTargetSystemProperties {
    bountyProperties: ITriggeredAbilityBaseProps | ITriggeredAbilityBaseProps[];
    bountySource?: IUnitCard;
}

export class CollectBountySystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ICollectBountyProperties> {
    public override readonly name = 'collect bounty';
    public override readonly eventName = EventName.OnBountyCollected;
    protected override readonly targetTypeFilter = [WildcardCardType.Unit];

    public eventHandler(event): void {
        // force optional to false since the player has already chosen to resolve the bounty
        const bountyAbilities = (event.bountyProperties as ITriggeredAbilityBaseProps[]).map((bountyProperties) => new BountyAbility(
            event.context.game,
            event.bountySource,
            {
                ...bountyProperties,
                optional: false
            }
        ));

        Contract.assertTrue(bountyAbilities.length > 0, `Found empty bounty list for ability on card ${event.context.source.internalName}`);

        if (bountyAbilities.length === 1) {
            this.resolveBountyAbility(bountyAbilities[0], event);
        } else {
            const player = event.context.player;
            const choices = bountyAbilities.map((ability) => ability.properties.title);

            const promptProperties = {
                activePromptTitle: 'Choose a Bounty ability to use',
                waitingPromptTitle: 'Waiting for opponent to choose a Bounty ability'
            };

            const handlers = bountyAbilities.map(
                (bountyAbility) => {
                    return () => {
                        this.resolveBountyAbility(bountyAbility, event);
                    };
                }
            );

            Object.assign(promptProperties, { choices, handlers });

            event.context.game.promptWithHandlerMenu(player, promptProperties);
        }
    }

    private resolveBountyAbility(ability: BountyAbility, event: any): void {
        event.context.game.resolveAbility(ability.createContext(event.context.player, event));
    }

    // since the actual effect of the bounty is resolved in a sub-window, we don't check its effects here
    public override canAffect(card: Card, context: TContext, additionalProperties: any = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        const { bountyProperties, bountySource } = this.generatePropertiesFromContext(context, additionalProperties);

        if (mustChangeGameState !== GameStateChangeRequired.None) {
            if (Helpers.asArray(bountyProperties).length === 0) {
                return false;
            }
        }

        return card === bountySource;
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const { bountyProperties, bountySource } = this.generatePropertiesFromContext(context, additionalProperties);
        event.bountyProperties = Helpers.asArray(bountyProperties);
        event.bountySource = bountySource ?? card;
    }
}
