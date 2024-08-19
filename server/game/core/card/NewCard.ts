import { IActionProps } from '../../Interfaces';
import { CardActionAbility } from '../ability/CardActionAbility';
import PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import TriggeredAbility from '../ability/TriggeredAbility';
import { IConstantAbility } from '../ongoingEffect/IConstantAbility';
import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';
import type Player from '../Player';
import Contract from '../utils/Contract';
import Card from './Card';
import { CardType, Location } from '../Constants';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import { checkConvertToEnum } from '../utils/EnumHelpers';

export type CardConstructor = new (...args: any[]) => NewCard;

export class NewCard extends OngoingEffectSource {
    public readonly title: string;

    protected override readonly id: string;
    protected _actions: PlayerOrCardAbility[] = [];
    protected readonly printedTypes: Set<CardType>;

    private _location: Location;

    public get actions() {
        return this._actions;
    }

    public get location() {
        return this._location;
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
    }


    // **************************************** INITIALIZATION HELPERS ****************************************
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


    // ******************************************* CARD TYPE HELPERS *******************************************
    // this is here to be overridden, we can't use abstract bc it doesn't work with mixins sadly
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected initializeForCurrentLocation() {
    }
}