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
import { checkConvertToEnum } from '../utils/EnumHelpers';

export type CardConstructor = new (...args: any[]) => NewCard;

export class NewCard extends OngoingEffectSource {
    public readonly title: string;

    protected override readonly id: string;
    protected _actions: PlayerOrCardAbility[] = [];

    protected readonly printedTypes: Set<CardType>;

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

        this.title = cardData.title;

        this.id = cardData.id;

        this.printedTypes = new Set(checkConvertToEnum(cardData.types, CardType));

        this.addDefaultPlayActions();
    }


    // **************************************** INITIALIZATION HELPERS ****************************************
    // TODO THIS PR: remove this and just do it in the class constructors?
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
        return false;
    }

    public isUnit(): boolean {
        return false;
    }

    public isUpgrade(): boolean {
        return false;
    }

    public isBase(): boolean {
        return false;
    }

    public isLeader(): boolean {
        return false;
    }

    public isLeaderUnit(): boolean {
        return false;
    }

    public isNonLeaderUnit(): boolean {
        return false;
    }

    public isToken(): boolean {
        return false;
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