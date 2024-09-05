export default class StatsModifier {
    public hp: number;
    public power: number;

    public constructor(power: number = 0, hp: number = 0) {
        this.power = power;
        this.hp = hp;
    }
}
