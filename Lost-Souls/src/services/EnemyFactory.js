import Eye from "../entities/Eye.js";
import Skeleton from "../entities/Skeleton.js";
import EnemyType from "../enums/EnemyType.js";

export default class EnemyFactory{

    static createInstance(type, dimensions, position, velocityLimit, map){
        switch(type){
            case EnemyType.Skeleton:
                return new Skeleton(dimensions, position, velocityLimit, map);
            
            case EnemyType.Eye:
                return new Eye(dimensions, position, velocityLimit, map);
            
            //case EnemyType.Boss:
                //return new Boss(dimensions, position, velocityLimit, map);
            }
    }
}