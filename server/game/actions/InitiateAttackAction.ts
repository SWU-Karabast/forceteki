import type { AbilityContext } from '../core/ability/AbilityContext.js';
import { PlayerAction } from '../core/ability/PlayerAction.js';
import { AbilityRestriction, TargetMode, WildcardZoneName } from '../core/Constants.js';
import * as EnumHelpers from '../core/utils/EnumHelpers.js';
import { exhaustSelf } from '../costs/CostLibrary.js';
import type { Card } from '../core/card/Card';
import type { IAttackProperties } from '../gameSystems/AttackStepsSystem.js';
import { AttackStepsSystem } from '../gameSystems/AttackStepsSystem.js';
import { GameSystemCost } from '../core/cost/GameSystemCost.js';
import { ExhaustSystem } from '../gameSystems/ExhaustSystem.js';
import type Game from '../core/Game.js';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties.js';

interface IInitiateAttackProperties extends IAttackProperties {
    allowExhaustedAttacker?: boolean;
}

/**
 * Implements the action for a player to initiate an attack from a unit.
 * Calls {@link AttackStepsSystem} to resolve the attack.
 *
 * Default behaviors can be overridden by passing in an {@link IInitiateAttackProperties} object.
 * See {@link GameSystemLibrary.initiateAttack} for using it in abilities.
 */
export class InitiateAttackAction extends PlayerAction {
    public constructor(game: Game, card: Card, private attackProperties?: IInitiateAttackProperties) {
        const exhaustCost = attackProperties?.allowExhaustedAttacker
            ? new GameSystemCost(new ExhaustSystem({ isCost: true }), true)
            : exhaustSelf();

        super(game, card, 'Attack', [exhaustCost], {
            mode: TargetMode.BetweenVariable,
            minNumCardsFunc: () => 1,
            maxNumCardsFunc: (context: AbilityContext) => (context.source as IUnitCard).getMaxUnitAttackLimit(),
            useSingleSelectModeFunc: (attacker: IUnitCard, possibleTargets: Card[]) => attacker.getMaxUnitAttackLimit() === 1 || possibleTargets.length === 1 || possibleTargets.some((card) => card.isBase()) && possibleTargets.filter((card) => card.isUnit()).length === 1,
            multiSelectCardCondition: (card: Card, selectedCards: Card[]) => (card.isBase() ? selectedCards.length === 0 : !selectedCards.some((card) => card.isBase())),
            immediateEffect: new AttackStepsSystem(Object.assign({}, attackProperties, { attacker: card })),
            zoneFilter: WildcardZoneName.AnyAttackable,
            attackTargetingHighlightAttacker: card,
            activePromptTitle: 'Choose a target for attack'
        });
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (context.player !== context.source.controller) {
            return 'player';
        }
        if (
            !ignoredRequirements.includes('zone') &&
            !EnumHelpers.isArena(context.source.zoneName)
        ) {
            return 'zone';
        }
        if (context.player.hasRestriction(AbilityRestriction.Attack, context)) {
            return 'restriction';
        }
        if (!this.targetResolvers[0].hasLegalTarget(context)) {
            return 'target';
        }

        return super.meetsRequirements(context, ignoredRequirements);
    }

    public override executeHandler(context: AbilityContext): void {
        const attackSystemProperties = Object.assign(this.attackProperties ?? {}, {
            attacker: context.source
        });

        new AttackStepsSystem(attackSystemProperties).resolve(context.target, context);
    }

    public override isAttackAction(): this is InitiateAttackAction {
        return true;
    }
}
