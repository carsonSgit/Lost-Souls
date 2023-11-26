/**
 * Used as the base class for all of our states, so we don't have to
 * define empty methods in each of them. StateMachine requires each
 * State have a set of four "interface" methods that it can reliably call,
 * so by inheriting from this base state, our State classes will all have
 * at least empty versions of these methods even if we don't define them
 * ourselves in the actual classes.
 */
export default class State {
	enter(parameters) { }

	exit() { }

	update(dt) { }

	render() { }
}
