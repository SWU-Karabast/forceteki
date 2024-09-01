import Player from '../Player';
import { InPlayCard } from './baseClasses/InPlayCard';
import Contract from '../utils/Contract';
import { CardType, Location, WildcardLocation } from '../Constants';
import { ActionAbility } from '../ability/ActionAbility';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import TriggeredAbility from '../ability/TriggeredAbility';
import * as EnumHelpers from '../utils/EnumHelpers';

interface IAbilitySet {
    actionAbilities: ActionAbility[];
    constantAbilities: IConstantAbility[];
    triggeredAbilities: TriggeredAbility[];
}


export class LeaderCard extends InPlayCard {
    protected _isDeployed = false;
    protected leaderSideAbilities: IAbilitySet;
    protected leaderUnitSideAbilities: IAbilitySet;

    public get isDeployed() {
        return this._isDeployed;
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertEqual(this.printedType, CardType.Leader);

        this.setupLeaderAbilities();
        this.leaderSideAbilities = this.generateCurrentAbilitySet();

        // TODO LEADER: add deploy epic action (see Base.ts for reference)
    }

    public override isLeader(): this is LeaderCard {
        return true;
    }

    protected setAbilities(abilities: IAbilitySet) {
        this.actionAbilities = abilities.actionAbilities;
        this.constantAbilities = abilities.constantAbilities;
        this.triggeredAbilities = abilities.triggeredAbilities;
    }

    /**
     * Create card abilities for the leader (non-unit) side by calling subsequent methods with appropriate properties
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected setupLeaderAbilities() {
    }

    protected generateCurrentAbilitySet(): IAbilitySet {
        return {
            actionAbilities: this.actionAbilities,
            constantAbilities: this.constantAbilities,
            triggeredAbilities: this.triggeredAbilities
        };
    }

    /** Register / un-register the event triggers for any triggered abilities */
    protected override updateTriggeredAbilityEvents(from: Location, to: Location, reset: boolean = true) {
        for (const triggeredAbility of this.triggeredAbilities) {
            if (this.isEvent()) {
                // TODO EVENTS: this block is here because jigoku would would register a 'bluff' triggered ability window in the UI, do we still need that?
                // normal event abilities have their own category so this is the only 'triggered ability' for event cards
                if (
                    to === Location.Deck ||
                            this.controller.isCardInPlayableLocation(this) ||
                            (this.controller.opponent && this.controller.opponent.isCardInPlayableLocation(this))
                ) {
                    triggeredAbility.registerEvents();
                } else {
                    triggeredAbility.unregisterEvents();
                }
            } else if (EnumHelpers.cardLocationMatches(to, triggeredAbility.location) && !EnumHelpers.cardLocationMatches(from, triggeredAbility.location)) {
                triggeredAbility.registerEvents();
            } else if (!EnumHelpers.cardLocationMatches(to, triggeredAbility.location) && EnumHelpers.cardLocationMatches(from, triggeredAbility.location)) {
                triggeredAbility.unregisterEvents();
            }
        }
    }

    /** Register / un-register the effect registrations for any constant abilities */
    protected override updateConstantAbilityEffects(from: Location, to: Location) {
        // removing any lasting effects from ourself
        if (!EnumHelpers.isArena(from) && !EnumHelpers.isArena(to)) {
            this.removeLastingEffects();
        }

        // check to register / unregister any effects that we are the source of
        for (const constantAbility of this.constantAbilities) {
            if (constantAbility.locationFilter === WildcardLocation.Any) {
                continue;
            }
            if (
                !EnumHelpers.cardLocationMatches(from, constantAbility.locationFilter) &&
                        EnumHelpers.cardLocationMatches(to, constantAbility.locationFilter)
            ) {
                constantAbility.registeredEffects = this.addEffectToEngine(constantAbility);
            } else if (
                EnumHelpers.cardLocationMatches(from, constantAbility.locationFilter) &&
                        !EnumHelpers.cardLocationMatches(to, constantAbility.locationFilter)
            ) {
                this.removeEffectFromEngine(constantAbility.registeredEffects);
                constantAbility.registeredEffects = [];
            }
        }
    }
}
