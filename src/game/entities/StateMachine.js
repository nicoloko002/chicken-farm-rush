/**
 * State interface - all states should implement this
 */
export class State {
  enter(entity) {}
  update(entity, deltaTime) {}
  exit(entity) {}
}

/**
 * Core State Machine
 */
export class StateMachine {
  constructor() {
    this.currentState = null;
    this.previousState = null;
    this.states = new Map();
  }

  addState(name, state) {
    this.states.set(name, state);
    this.currentState ??= state;
    return this;
  }

  transition(stateName, entity, additionalConfig) {
    if (!this.states.has(stateName)) {
      console.warn(`State "${stateName}" not found`);
      return;
    }

    const nextState = this.states.get(stateName);

    if (this.currentState === nextState) return;
    console.debug(`State change from "${this.currentState.constructor.name}" to "${nextState.constructor.name}"`)
    
    // Exit current state
    this.currentState?.exit(entity);

    // Transition
    this.previousState = this.currentState;
    this.currentState = nextState;

    // Enter new state
    this.currentState.enter(entity, additionalConfig);
  }

  update(entity, deltaTime) {
    this.currentState?.update(entity, deltaTime);
  }

  getCurrentStateName() {
    for (const [name, state] of this.states) {
      if (state === this.currentState) return name;
    }
    return null;
  }
}
