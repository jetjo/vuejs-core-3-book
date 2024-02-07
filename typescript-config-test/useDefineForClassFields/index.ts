class Base {
  set data(value: string) {
    console.log('data changed to ' + value)
  }
}
class Derived extends Base {
  // No longer triggers a 'console.log'
  // when using 'useDefineForClassFields'.
  // @ts-ignore
  data = 10
}

interface Animal {
  animalStuff: any
}
interface Dog extends Animal {
  dogStuff: any
}
class AnimalHouse {
  resident: Animal
  constructor(animal: Animal) {
    this.resident = animal
  }
}
class DogHouse extends AnimalHouse {
  // Initializes 'resident' to 'undefined'
  // after the call to 'super()' when
  // using 'useDefineForClassFields'!
  // @ts-ignore
  resident: Dog
  constructor(dog: Dog) {
    super(dog)
  }
}

// export type { Dog }

export { Derived, DogHouse }
