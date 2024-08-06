import { Elements } from "./Constants";
import EffectSource from "./EffectSource";
import BaseCard from "./basecard";
import Game from "./game";

type Info = {
    element: Elements
    key: string,
    prettyName: string,
}

export class ElementSymbol extends EffectSource {
    printedType = 'elementSymbol';
    persistentEffects = [];
    element: Elements
    key: string
    prettyName: string

    constructor(game: Game, public card: BaseCard, info: Info) {
        super(game, `${info.prettyName} (${info.element})`);
        this.element = info.element;
        this.key = info.key;
        this.prettyName = info.prettyName;
    }
}

