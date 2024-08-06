import { GameModes } from '../GameModes';
import { EffectNames, Locations } from './Constants';
import AbilityDsl from './abilitydsl';
import BaseCard from './basecard';
import type Player from './player';
import type DrawCard from './drawcard';

type CardData = {
    strength: number;
    element: string[];
    type: 'province';
    side: 'province';
    name: string;
    id: string;
};

export class ProvinceCard extends BaseCard {
    isProvince = true;
    isBroken = false;
    menu = [
        { command: 'break', text: 'Break/unbreak this province' },
        { command: 'hide', text: 'Flip face down' },
        { command: 'dishonor', text: 'Dishonor' },
        { command: 'honor', text: 'Honor' },
        { command: 'taint', text: 'Taint/Cleanse' }
    ];

    constructor(
        owner: Player,
        cardData: CardData = {
            strength: 3,
            element: [],
            type: 'province',
            side: 'province',
            name: 'Skirmish Province',
            id: 'skirmish-province'
        }
    ) {
        super(owner, cardData);
        this.persistentEffect({
            condition: (context) => context.source.hasEminent(),
            location: Locations.Any,
            effect: AbilityDsl.effects.cardCannot('turnFacedown')
        });
    }

    get strength() {
        return this.getStrength();
    }

    getStrength(): number {
        if (this.anyEffect(EffectNames.SetProvinceStrength)) {
            return this.mostRecentEffect(EffectNames.SetProvinceStrength);
        }

        const strength =
            this.baseStrength +
            this.sumEffects(EffectNames.ModifyProvinceStrength) +
            this.getDynastyOrStrongholdCardModifier();
        const multipliedStrength = this.getEffects(EffectNames.ModifyProvinceStrengthMultiplier).reduce(
            (total: number, value: number) => total * value,
            strength
        );
        return Math.max(0, multipliedStrength);
    }

    get baseStrength() {
        return this.getBaseStrength();
    }

    get printedStrength() {
        const parsed = parseInt(this.cardData.strength, 10);
        return isNaN(parsed) ? 0 : parsed;
    }

    getBaseStrength(): number {
        if (this.anyEffect(EffectNames.SetBaseProvinceStrength)) {
            return this.mostRecentEffect(EffectNames.SetBaseProvinceStrength);
        }
        return (
            this.sumEffects(EffectNames.ModifyBaseProvinceStrength) +
            (parseInt(this.cardData.strength) ? parseInt(this.cardData.strength) : 0)
        );
    }

    getDynastyOrStrongholdCardModifier(): number {
        const province = this.controller.getSourceList(this.location);
        const canBeIncreased = !this.anyEffect(EffectNames.ProvinceCannotHaveSkillIncreased);

        return province.reduce((bonus, card) => {
            let s = card.getProvinceStrengthBonus();
            if (!canBeIncreased && s > 0) {
                s = 0;
            }
            return bonus + s;
        }, 0);
    }

    get element() {
        return this.getElement();
    }

    getElement() {
        const symbols = this.getCurrentElementSymbols();
        const elementArray = [];
        symbols.forEach((symbol) => {
            if (symbol.key.startsWith('province-element')) {
                elementArray.push(symbol.element);
            }
        });

        return elementArray;
    }

    isElement(element) {
        return this.element.includes(element);
    }

    hasElementSymbols() {
        return this.cardData.elements && this.cardData.elements.length > 0;
    }

    getPrintedElementSymbols() {
        const symbols = [];
        if (this.hasElementSymbols()) {
            const elements =
                this.cardData.elements === 'all' ? ['air', 'earth', 'fire', 'void', 'water'] : this.cardData.elements;
            elements.forEach((element, index) => {
                symbols.push({
                    key: `province-element-${index}`,
                    prettyName: "The Province's Element",
                    element: element
                });
            });
        }
        return symbols;
    }

    flipFaceup() {
        this.facedown = false;
    }

    leavesPlay() {
        this.removeAllTokens();
        this.makeOrdinary();
        super.leavesPlay();
    }

    isConflictProvince(): boolean {
        return this.game.currentConflict && this.game.currentConflict.getConflictProvinces().includes(this);
    }

    canBeAttacked() {
        const fateCostToAttack = this.getFateCostToAttack();
        const attackers = this.game.isDuringConflict() ? this.game.currentConflict.attackers : [];
        const fateToDeclareAttackers = attackers.reduce(
            (total, card) => total + card.sumEffects(EffectNames.FateCostToAttack),
            0
        );

        return (
            !this.isBroken &&
            !this.anyEffect(EffectNames.CannotBeAttacked) &&
            (!this.controller.opponent || this.controller.opponent.fate >= fateCostToAttack + fateToDeclareAttackers) &&
            (this.location !== Locations.StrongholdProvince ||
                this.controller.getProvinces((card) => card.isBroken).length > 2 ||
                this.controller.anyEffect(EffectNames.StrongholdCanBeAttacked))
        );
    }

    canDeclare(type, ring) {
        return this.canBeAttacked() && !this.getEffects(EffectNames.CannotHaveConflictsDeclaredOfType).includes(type);
    }

    getFateCostToAttack() {
        return this.sumEffects(EffectNames.FateCostToRingToDeclareConflictAgainst);
    }

    isBlank(): boolean {
        const ignoreTokens =
            this.game.currentConflict &&
            this.game.currentConflict.anyEffect(EffectNames.ConflictIgnoreStatusTokens) &&
            this.isConflictProvince();
        const dishonored = this.isDishonored && !ignoreTokens;
        return this.isBroken || dishonored || super.isBlank();
    }

    breakProvince(): void {
        this.isBroken = true;
        this.removeAllTokens();
        if (!this.controller.opponent) {
            return;
        }

        this.game.addMessage('{0} has broken {1}!', this.controller.opponent, this);

        if (
            this.location === Locations.StrongholdProvince ||
            (this.game.gameMode === GameModes.Skirmish &&
                this.controller.getProvinces((card: ProvinceCard) => card.isBroken).length > 2)
        ) {
            this.game.recordWinner(this.controller.opponent, 'conquest');
            return;
        }

        for (const dynastyCard of this.cardsInSelf()) {
            if (!dynastyCard) {
                // Why?
                continue;
            }

            const choosingPlayer =
                this.game.isDuringConflict() && this.game.currentConflict?.attackingPlayer
                    ? this.game.currentConflict.attackingPlayer
                    : this.controller.opponent;
            this.game.promptWithHandlerMenu(choosingPlayer, {
                activePromptTitle: `Do you wish to discard ${
                    dynastyCard.isFacedown() ? 'the facedown card' : dynastyCard.name
                }?`,
                source: 'Break ' + this.name,
                choices: ['Yes', 'No'],
                handlers: [
                    () => {
                        this.game.addMessage(
                            '{0} chooses to discard {1}',
                            choosingPlayer,
                            dynastyCard.isFacedown() ? 'the facedown card' : dynastyCard
                        );
                        this.game.applyGameAction(this.game.getFrameworkContext(), { discardCard: dynastyCard });
                    },
                    () =>
                        this.game.addMessage(
                            '{0} chooses not to discard {1}',
                            choosingPlayer,
                            dynastyCard.isFacedown() ? 'the facedown card' : dynastyCard
                        )
                ]
            });
        }
    }

    restoreProvince(): void {
        this.isBroken = false;
        this.facedown = false;
    }

    cannotBeStrongholdProvince(): boolean {
        return this.hasEminent();
    }

    startsGameFaceup(): boolean {
        return this.hasEminent();
    }

    hideWhenFacedown(): boolean {
        return false;
    }

    getMenu() {
        const menu = super.getMenu();

        if (menu) {
            if (
                this.game.isDuringConflict() &&
                !this.isConflictProvince() &&
                this.canBeAttacked() &&
                this.game.currentConflict.getConflictProvinces().some((a) => a.controller === this.controller)
            ) {
                menu.push({ command: 'move_conflict', text: 'Move Conflict' });
            }

            if (this.cardsInSelf().length <= 0) {
                menu.push({ command: 'refill', text: 'Refill Province' });
            }
        }

        return menu;
    }

    getSummary(activePlayer: Player, hideWhenFaceup: boolean) {
        const baseSummary = super.getSummary(activePlayer, hideWhenFaceup);
        return {
            ...baseSummary,
            isProvince: this.isProvince,
            isBroken: this.isBroken,
            attachments: this.attachments.map((attachment) => attachment.getSummary(activePlayer, hideWhenFaceup))
        };
    }

    allowAttachment(attachment: DrawCard): boolean {
        if (this.allowedAttachmentTraits.some((trait) => attachment.hasTrait(trait))) {
            return true;
        }

        return true;
    }

    hasEminent(): boolean {
        //Facedown provinces are out of play and their effects don't evaluate, so we check for the printed keyword
        return this.hasKeyword('eminent') || (!this.isBlank() && this.hasPrintedKeyword('eminent'));
    }

    isFaceup(): boolean {
        if (this.game.gameMode === GameModes.Skirmish) {
            return false;
        }
        return super.isFaceup();
    }

    isFacedown(): boolean {
        return this.game.gameMode !== GameModes.Skirmish && super.isFacedown();
    }

    cardsInSelf(): DrawCard[] {
        return this.controller.getDynastyCardsInProvince(this.location);
    }
}