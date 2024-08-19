import { IActionProps } from '../../Interfaces';
import { CardActionAbility } from '../ability/CardActionAbility';
import PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import TriggeredAbility from '../ability/TriggeredAbility';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';
import type Player from '../Player';
import Contract from '../utils/Contract';
import Card from './Card';
import { CardType } from '../Constants';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';

export type CardConstructor = new (...args: any[]) => NewCard;

export class NewCard extends OngoingEffectSource {
    protected override readonly id: string;
    protected _actions: PlayerOrCardAbility[] = [];

    private readonly printedTypes: Set<CardType>;

    public get actions() {
        return this._actions;
    }

    public get types(): Set<CardType> {
        return this.printedTypes;
    }

    public constructor(
        public readonly owner: Player,
        private readonly cardData: any
    ) {
        super(owner.game);

        this.id = cardData.id;
        this.printedTypes = new Set(cardData.types);

        this.addDefaultPlayActions();
    }


    // **************************************** INITIALIZATION HELPERS ****************************************
    protected addDefaultPlayActions() {
        if (this.printedTypes.has(CardType.Leader) && this.printedTypes.has(CardType.Unit)) {
            this._actions.push(new InitiateAttackAction(this.generateOriginalCard()));
        } else if (this.printedTypes.has(CardType.Unit)) {
            this._actions.push(new InitiateAttackAction(this.generateOriginalCard()));
            this._actions.push(new PlayUnitAction(this.generateOriginalCard()));
        } else if (this.printedTypes.has(CardType.Leader)) {
            // TODO LEADER: add deploy action
        } else if (this.printedTypes.has(CardType.Upgrade)) {
            // TODO UPGRADES: add play upgrade action
        } else if (this.printedTypes.has(CardType.Event)) {
            // TODO EVENTS: add play event action
        }

        // if base, do nothing
    }


    // TODO THIS PR: remove this
    protected generateOriginalCard() {
        return new Card(this.owner, this.cardData);
    }

    protected unpackConstructorArgs(...args: any[]): [Player, any] {
        Contract.assertArraySize(args, 2);

        return [args[0] as Player, args[1]];
    }


    // ******************************************* CARD TYPE HELPERS *******************************************
    public isEvent(): boolean {
        return this.hasSomeType(CardType.Event);
    }

    public isUnit(): boolean {
        return this.hasSomeType(CardType.Unit);
    }

    public isUpgrade(): boolean {
        return this.hasSomeType(CardType.Upgrade);
    }

    public isBase(): boolean {
        return this.hasSomeType(CardType.Base);
    }

    public isLeader(): boolean {
        return this.hasSomeType(CardType.Leader);
    }

    public isLeaderUnit(): boolean {
        return this.hasEveryType([CardType.Leader, CardType.Unit]);
    }

    public isToken(): boolean {
        return this.hasSomeType(CardType.Token);
    }

    public hasSomeType(types: Set<CardType> | CardType | CardType[]): boolean {
        let typesToCheck: Set<CardType> | CardType[];

        if (!(types instanceof Set) && !(types instanceof Array)) {
            typesToCheck = [types];
        } else {
            typesToCheck = types;
        }

        for (const type of typesToCheck) {
            if (this.types.has(type)) {
                return true;
            }
        }
        return false;
    }

    public hasEveryType(types: Set<CardType> | CardType[]): boolean {
        let typesToCheck: Set<CardType> | CardType[];

        if (!(types instanceof Set) && !(types instanceof Array)) {
            typesToCheck = [types];
        } else {
            typesToCheck = types;
        }

        for (const type of typesToCheck) {
            if (!this.types.has(type)) {
                return false;
            }
        }
        return false;
    }
}