import type { ITokenCard } from './propertyMixins/Token';
import { AsToken } from './propertyMixins/Token';
import type { INonLeaderUnitCard } from './NonLeaderUnitCard';
import { NonLeaderUnitCard } from './NonLeaderUnitCard';
import { UpgradeCard } from './UpgradeCard';
import type { IUpgradeCard } from './CardInterfaces';
import { InPlayCard } from './baseClasses/InPlayCard';
import { CardType, EventName } from '../Constants';
import { registerStateBase } from '../GameObjectUtils';
import type { Game } from '../Game';

const TokenUnitParent = AsToken(NonLeaderUnitCard);
const TokenUpgradeParent = AsToken(UpgradeCard);
const TokenCardParent = AsToken(InPlayCard);

export interface ITokenUpgradeCard extends ITokenCard, IUpgradeCard {}
export interface ITokenUnitCard extends ITokenCard, INonLeaderUnitCard {}

@registerStateBase()
export class TokenUnitCard extends TokenUnitParent implements ITokenUnitCard {
    public declare state: never;

    public override isTokenUnit(): this is ITokenUnitCard {
        return true;
    }

    protected override getType(): CardType {
        if (this.isLeaderAttachedToThis()) {
            return CardType.TokenLeaderUnit;
        }
        return super.getType();
    }
}

@registerStateBase()
export class TokenUpgradeCard extends TokenUpgradeParent implements ITokenUpgradeCard {
    public declare state: never;

    /**
     * Registers the game-level rules listeners for token upgrades. Called once at game start from
     * {@link Game.registerGlobalRulesListeners}, mirroring {@link UnitPropertiesCard.registerRulesListeners}.
     */
    public static registerRulesListeners(game: Game) {
        // Advantage tokens are defeated when their attached unit's attack or defense ends. Rather than
        // each token registering its own persistent trigger listener while attached (which adds per-token
        // engine overhead when many are in play), this single game-level listener transiently registers
        // the involved tokens' defeat abilities only for the duration of the attack -- the same approach
        // unit keyword abilities use (e.g. Restore via OnAttackDeclared). See issue #2587.
        //
        // We hook the OnAttackEnd ':postResolve' emit (mirroring the OnUnitEntersPlay ':postResolve' hook
        // used for "when played" keywords): registering here means the abilities are picked up by the
        // window's second trigger emit in EventWindow.postResolutionTriggers, exactly like Ambush. They're
        // unregistered when the OnAttackEnd event is cleaned up, after its triggers have resolved.
        game.on(EventName.OnAttackEnd + ':postResolve', (event) => {
            const attack = event.attack;
            if (attack == null) {
                return;
            }

            const involvedUnits = [attack.attacker, ...attack.getAllTargets()]
                .filter((card) => card?.isUnit() && card.isInPlay());

            for (const unit of involvedUnits) {
                for (const upgrade of unit.upgrades) {
                    if (upgrade.isAdvantage()) {
                        for (const ability of upgrade.getTriggeredAbilities()) {
                            ability.registerEvents();
                            event.addCleanupHandler(() => ability.unregisterEvents());
                        }
                    }
                }
            }
        });
    }

    public override isTokenUpgrade(): this is ITokenUpgradeCard {
        return true;
    }
}

@registerStateBase()
export class TokenCard extends TokenCardParent implements ITokenCard {
    public declare state: never;
}
